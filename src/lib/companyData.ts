
import { CompanyInfo } from "@/types";

export const COMPANY_DATA: Record<string, CompanyInfo> = {
  'SEBAI AMA': {
    name: 'SEBAI AMA',
    address: '38-40 RUE MONTAIGE, BATHA MAARIF',
    phone: '0522991403',
    fax: '0522992424',
    rc: '96175',
    cnss: '6009197',
    patente: '34772854',
    ice: '000000664000017'
  },
  'STE TAHA SBAI sarl': {
    name: 'STE TAHA SBAI sarl',
    address: 'LOT. AL MASSIRA N°: 152 BI ES-SMARA',
    phone: '0661354432',
    fax: '0522994424',
    rc: '315',
    tf: '77401223',
    if: '37730898',
    cnss: '8377633',
    ice: '002391520000017'
  },
  'STE TASNIM SBAI sarl': {
    name: 'STE TASNIM SBAI sarl',
    address: 'LOT. AL MASSIRA N°: 152 ES-SMARA',
    phone: '0661354432',
    fax: '0522994424',
    rc: '665',
    tf: '77410800',
    if: '15198585',
    cnss: '9802944',
    ice: '001560306000002'
  },
  'STE SEBAI FRERES DISTRIBUTION': {
    name: 'STE SEBAI FRERES DISTRIBUTION',
    address: 'DOUAR EL FOKRA OLD AZZOUZ CASABLANCA',
    phone: '0522 99 14 03',
    fax: '0522 30 34 94',
    rc: '306397',
    tf: '91350127',
    if: '15179892',
    cnss: '4096584',
    ice: '000217303000058'
  }
};

export function getCompanyInfo(companyName: string): CompanyInfo {
  return COMPANY_DATA[companyName] || COMPANY_DATA['SEBAI AMA'];
}
