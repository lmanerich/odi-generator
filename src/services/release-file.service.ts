import { Reference } from '@src/models/reference.model';
import { Response } from 'express';
import { ColInfo, utils, WorkSheet, write } from 'xlsx';
import xml2js from 'xml2js';

function parseProcesses(releaseName: string, processes: any[]): Reference[] {
    const references: Reference[] = [];
    console.log(`Processes length: ${processes.length}`);
    for (const process of processes) {
        //console.log(process);

        if (process.process?.length > 0) {
            references.push(...parseProcesses(releaseName, process.process));
        }

        const stage = process.stage;
        if (stage) {
            references.push(...parseStages(releaseName, stage));
        }
    }

    return references;
}

function parseStages(releaseName: string, stages: any[]): Reference[] {
    const references: Reference[] = [];
    console.log(`Process stage length: ${stages.length}`);
    for (const stage of stages) {
        if (stage.resource) {
            //console.log(stage);
            //console.log(stage.resource);

            const reference = new Reference();
            reference.releaseName = releaseName;
            reference.object = stage.resource[0].$.object;
            reference.action = stage.resource[0].$.action;

            if (stage.inputs) {
                reference.inputs = [];
                //console.log(JSON.stringify(stage.inputs, undefined, 4));
                for (const input of stage.inputs) {
                    reference.inputs.push(input.input[0].$.name);
                }
            }
            if (stage.outputs) {
                reference.outputs = [];
                //console.log(JSON.stringify(stage.outputs, undefined, 4));
                for (const output of stage.outputs) {
                    reference.outputs.push(output.output[0].$.name);
                }
            }

            references.push(reference);
        }
    }

    return references;
}

function parseObjects(releaseName: string, objects: any[]) {
    console.log(`Objects length: ${objects.length}`);
    for (const object of objects) {
        //console.log(object);

        parseProcesses(releaseName, object.process.process);
    }
}

export const releaseFileService = {
    async parse(fileContents: string): Promise<Reference[]> {
        console.log(fileContents.length);

        const response: Reference[] = [];

        const parser = new xml2js.Parser();
        const xml = await parser.parseStringPromise(fileContents);
        if (xml) {
            console.log(xml);

            let releaseName: string = 'Undefined';
            if (xml.hasOwnProperty('bpr:release') && xml['bpr:release'].hasOwnProperty('bpr:name')) {
                releaseName = xml['bpr:release']['bpr:name'].toString().replace('.bprelease', '');
            }

            if (xml.hasOwnProperty('bpr:release') && xml['bpr:release'].hasOwnProperty('bpr:contents')) {
                const content = xml['bpr:release']['bpr:contents'];
                console.log(`Contents length: ${content.length}`);
                for (const item of content) {
                    console.log(item);

                    response.push(...parseProcesses(releaseName, item.process));
                    //parseObjects(item.object);
                }
            }
        }

        const objectActionList: string[] = [];
        const unique: Reference[] = [];
        for (const reference of response) {
            // ignore blue prism objects
            if (reference.object.toLowerCase().indexOf('blueprism.') === 0) {
                continue;
            }

            const key = `${reference.object}_${reference.action}`;
            if (objectActionList.indexOf(key) === -1) {
                objectActionList.push(key);
                unique.push(reference);
            }
        }
        return unique.sort((a, b) => {
            if (a.object > b.object) {
                return 1;
            }
            if (b.object > a.object) {
                return -1;
            }

            if (a.action > b.action) {
                return 1;
            }
            if (b.action > a.action) {
                return -1;
            }

            return 0;
        });
    },

    getSpreadSheet(res: Response, references: Reference[]) {
        const wb = utils.book_new();

        let filename: string = 'odi-generator';
        const sheets: { [key: string]: string[][] } = {};
        for (const reference of references) {
            filename = `${reference.releaseName}-odi`;

            let sheetName: string = 'Geral';
            if (reference.object.toLowerCase().indexOf('utility') === 0) {
                sheetName = 'Utilities';
            } else if (reference.object.toLowerCase().indexOf('ie_internetexplorer') === 0) {
                sheetName = 'InternetExplorer';
            } else if (reference.object.indexOf('_') > -1) {
                sheetName = reference.object.substr(0, reference.object.indexOf('_'));
            }

            if (!sheets[sheetName]) {
                sheets[sheetName] = [];
            }
            sheets[sheetName].push([reference.object, reference.action, reference.inputs?.join(', '), reference.outputs?.join(', ')]);
        }

        for (const sheetName in sheets) {
            const values = sheets[sheetName];

            const ws: WorkSheet = utils.aoa_to_sheet([['Objeto', 'A????o', 'Inputs', 'Outputs']]);
            utils.sheet_add_aoa(ws, values, { origin: 'A2' });

            const wscols: ColInfo[] = [];
            for (const row of values) {
                for (let i = 0; i < row.length; i++) {
                    if (row[i]) {
                        const cellLength: number = row[i].toString().length + 2;
                        if (wscols[i]) {
                            wscols[i] = { wch: Math.max(cellLength, wscols[i].wch || 0) };
                        } else {
                            wscols[i] = { wch: cellLength };
                        }
                    }
                }
            }
            ws['!cols'] = wscols;

            utils.book_append_sheet(wb, ws, sheetName);
        }

        res.writeHead(200, {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        });

        const download = write(wb, { bookType: 'xlsx', bookSST: false, type: 'buffer' });

        res.end(download);
    },
};
