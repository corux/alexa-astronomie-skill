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
    .replace(/([0-9]{1,2})¼/g, "$1:15")
    .replace(/([0-9]{1,2})½/g, "$1:30")
    .replace(/([0-9]{1,2})¾/g, "$1:45");
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
        timeout: 2000,
      } as any);
      return response;
    } catch (error) {
      if (!shouldRetry()) {
        throw error;
      }
    }
  }
}

const handler: Handler = async () => {
  const response = await retrieveData();
  const encoding = response.headers["content-type"].match(/charset=(.*$)/)[1];
  const body = iconv.decode(response.data, encoding);
  const $ = cheerio.load(body);
  const title = $("h3").text();
  const text = fixText($("h3 + *").text());
  const date = parseGermanDate(title);

  return {
    mainText: text,
    redirectionUrl: "https://news.astronomie.info/hah",
    titleText: title,
    uid: date.toISOString(),
    updateDate: date.toISOString(),
  };
};

export { handler };
