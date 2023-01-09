import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Transactions {
  _id: String;
  walletId: String;
  amount: Number;
  balance: Number;
  date: String;
  description: String;
  type: String;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  transactions: Transactions[] = [];
  public localData:any;
  baseURL: string = "http://localhost:3000";
  constructor(private http: HttpClient){}ngOnInit(): void {
    this.localData = localStorage.getItem('dataSource');
    if(this.localData) {
      this.getPreviewData(this.localData).subscribe((res) => {
        this.showTransaction = true
        this.transactions = res
        console.log(res);
      })
    }
  }
;
  public username: any;
  public balance: any;


  public amount: any;
  public description: any;

 public  walletId : any
 showTransaction = false

 async setup() {
    let req = {
      name: this.username,
      balance: parseInt(this.balance),
      date: new Date(),
    };

   await this.walletSetup(req).subscribe(async (res) => {
     // this.transactions = res
      this.walletId  = res?.id
      console.log(`called wallet setup and wallet id is ${JSON.stringify(res) }`);
      console.log(res);
      localStorage.setItem('dataSource', this.walletId.toString());
      this.localData = this.walletId.toString();
    await this.getPreviewData(this.walletId).subscribe((res) => {
     this.showTransaction = true
        this.transactions = res
        console.log(res);
      });
    });

  }

  async creditDebit() {
    let req = {
      description: this.description,
      amount: parseInt(this.amount),
    };

   await this.credDeb(req).subscribe(async (res) => {
     // this.transactions = res
      // this.walletId  = res?.id
      console.log(`called to add transaction credit/debit and wallet id is ${JSON.stringify(res) }`);
      console.log(res);
      console.log('******',this.localData);
    await this.getPreviewData(this.localData).subscribe((res) => {
     this.showTransaction = true
        this.transactions = res
        console.log(res);
        this.amount = '';
        this.description = '';
      });
    });


  }

  getPreviewData(walletId: any): Observable<any> {
    return this.http.get(`${this.baseURL}/wallet/transactions?walletId=${walletId}`);
  }



  walletSetup(data: any): Observable<any> {
    const headers = { 'content-type': 'application/json'}
    const body=JSON.stringify(data);
    console.log("walletSetup", body)
    return this.http.post(`${this.baseURL}/wallet/setup`, body,{'headers':headers})
  }


  credDeb(data: any): Observable<any> {
    const headers = { 'content-type': 'application/json'}
    const body=JSON.stringify(data);
    console.log("inside credDeb data", body)
    console.log("this.localData", this.localData)
    return this.http.post(`${this.baseURL}/wallet/transact/${this.localData}`, body,{'headers':headers})
  }

  public async saveDataInCSV1(name: string, data: Array<any>): Promise<void> {
    console.log("saveDataInCSV1");

    const csvContent = this.saveDataInCSV(data);

    const hiddenElement = document.createElement('a');
    hiddenElement.href =
      'data:text/csv;charset=utf-8,' + encodeURI(await csvContent);
    hiddenElement.target = '_blank';
    hiddenElement.download = name + '.csv';
    hiddenElement.click();
  }

  async saveDataInCSV(data: Array<any>): Promise<string> {
    if (data.length == 0) {
      return '';
    }

    const propertyNames = Object.keys(data[0]);
    const rowWithPropertyNames = propertyNames.join(',') + '\n';

    let csvContent = rowWithPropertyNames;

    const rows: string[] = [];

    data.forEach((item) => {
      const values: string[] = [];

      propertyNames.forEach((key) => {
        let val: any = item[key];

        if (val !== undefined && val !== null) {
          val = new String(val);
        } else {
          val = '';
        }
        values.push(val);
      });
      rows.push(values.join(','));
    });
    csvContent += rows.join('\n');

    return csvContent;
  }

}
