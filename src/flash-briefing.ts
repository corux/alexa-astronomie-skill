import { Handler } from "aws-lambda";
import axios from "axios";
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

const handler: Handler = async () => {
  const url = "https://news.astronomie.info/hah?printpage=";
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 2000,
  } as any);
  const encoding = response.headers["content-type"].match(/charset=(.*$)/)[1];
  const body = iconv.decode(response.data, encoding);
  const $ = cheerio.load(body);
  const title = $("h3").text();
  const text = $("h3 + *").text();
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
