import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as fs from 'fs';
import * as util from 'util';
import pdf from 'pdf-parse';

const url = 'https://api-new.whitepaper.io/documents/pdf?slug=lido-dao';

axiosRetry(axios, { retries: 5 });

axios({
   url,
   method: 'GET',
   responseType: 'stream',
}).then(response => {
   const stream = response.data;
   const writeStream = fs.createWriteStream('./output.pdf');
   stream.pipe(writeStream);

   writeStream.on('finish', async () => {
       const dataBuffer = fs.readFileSync('./output.pdf');
       const data = await pdf(dataBuffer);
       console.log(data.text);
   });
});
