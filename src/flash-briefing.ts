import { Handler } from "aws-lambda";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import * as iconv from "iconv-lite";

function parseGermanDate(text: string): Date {
  const match = text.match(/[^0-9]*([0-9]{1,2})\.(.*)([0-9]{4})/);
  if (match) {
    const germanMonths = [
      "Januar", "Februar", "März",
      "April", "Mai", "Juni",
      "Juli", "August", "September",
      "Oktober", "November", "Dezember",
    ].map((elem) => elem.toUpperCase());
    const year = parseInt(match[3], 10);
    const month = germanMonths.indexOf(match[2].trim().toUpperCase());
    const day = parseInt(match[1], 10);
    return new Date(year, month, day);
  }
}

function fixText(text: string): string {
  return text
    .replace(/([0-9]{1,2})¼\s*Uhr/g, "$1:15")
    .replace(/([0-9]{1,2})½\s*Uhr/g, "$1:30")
    .replace(/([0-9]{1,2})¾\s*Uhr/g, "$1:45")
    .replace(/([0-9]{1,2})([¼½¾])/g, "$1 $2")
    .replace(/([0-9]{1,2}\.)\/([0-9]{1,2}\.)/g, "$1 bis $2");
}

async function retrieveData(): Promise<AxiosResponse<any>> {
  let retryCount = 0;
  const shouldRetry = () => retryCount < 3;
  while (shouldRetry()) {
    retryCount++;
    try {
      const url = "https://news.astronomie.info/hah?printpage=";
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 1800,
      } as any);
      return response;
    } catch (error) {
      if (!shouldRetry()) {
        throw error;
      }
    }
  }
}

let cache;

const handler: Handler = async () => {
  if (cache && new Date(cache.updateDate).toDateString() === new Date().toDateString()) {
    return cache;
  }

  const response = await retrieveData();
  const encoding = response.headers["content-type"].match(/charset=(.*$)/)[1];
  const body = iconv.decode(response.data, encoding);
  const $ = cheerio.load(body);
  const title = $("h3").text();
  const text = fixText($("h3 + *").text());
  const date = parseGermanDate(title);

  const result = {
    mainText: text,
    redirectionUrl: "https://news.astronomie.info/hah",
    titleText: title,
    uid: date.toISOString(),
    updateDate: date.toISOString(),
  };

  cache = result;

  return result;
};

export { handler };
