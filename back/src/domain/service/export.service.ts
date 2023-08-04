import { Inject, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IRepoCra } from '../IRepository/IRepoCra';
import { Raison } from '../model/Raison';

@Injectable()
export class ExportService {
  constructor(@Inject('IRepoCra') private readonly repoCra: IRepoCra) {}
  async generateExcel(month: number, year: number): Promise<ExcelJS.Buffer> {
    //fetch data to fill
    const craData = await this.repoCra.findByMonthYear(month, year);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Recap du mois');

    // headers
    const headerRow = worksheet.addRow([
      'Collaborateur',
      'Période',
      "Nombre d'absences",
      '',
      '',
      '',
      '',
      'Nombre de jours travaillés',
      'Recap',
    ]);
    worksheet.addRow([
      '',
      '',
      'Conges',
      'RTT',
      'Exceptionelle',
      'Formation',
      'Maladie',
      '',
      '',
    ]);
    worksheet.mergeCells('C1:G1');
    worksheet.mergeCells('A1:A2');
    worksheet.mergeCells('B1:B2');
    worksheet.mergeCells('H1:H2');
    worksheet.mergeCells('I1:I2');
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8ac2d4' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    //size
    worksheet.getColumn('A').width = 30;
    worksheet.getColumn('B').width = 20;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 15;
    worksheet.getColumn('E').width = 15;
    worksheet.getColumn('F').width = 15;
    worksheet.getColumn('G').width = 15;
    worksheet.getColumn('H').width = 25;
    worksheet.getColumn('I').width = 15;
    worksheet.getRow(1).height = 15;
    worksheet.getRow(1).font = {
      bold: true,
      size: 12,
    };

    // data
    craData.forEach((item) => {
      const absenceCounts = {
        Conges: 0,
        RTT: 0,
        Exceptionnelle: 0,
        Formation: 0,
        Maladie: 0,
      };
      item.absences.forEach((absence) => {
        if (absence.raison === Raison.Conges) absenceCounts.Conges++;
        else if (absence.raison === Raison.RTT) absenceCounts.RTT++;
        else if (absence.raison === Raison.Exceptionnelle)
          absenceCounts.Exceptionnelle++;
        else if (absence.raison === Raison.Formation) absenceCounts.Formation++;
        else if (absence.raison === Raison.Maladie) absenceCounts.Maladie++;
      });

      worksheet.addRow([
        `${item.collab.name} ${item.collab.lastname}`,
        `${month}/${year}`,
        absenceCounts.Conges / 2,
        absenceCounts.RTT / 2,
        absenceCounts.Exceptionnelle / 2,
        absenceCounts.Formation / 2,
        absenceCounts.Maladie / 2,
        item.activities.length / 2,
        `${(item.absences.length + item.activities.length) / 2}/${
          item.calculateBusinessDays(year, month) - item.holidays.length
        }`,
      ]);
      worksheet.lastRow.height = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}