import { HttpException, HttpStatus } from '@nestjs/common';
import * as https from 'https';
import axios from 'axios';
import { convert } from 'html-to-text';
import { ScraperDto } from 'src/spark-gpt/entities/dtos/scrapper_dto';
import { Conversations, Messages } from 'src/chat/entities/schema';
import { channel } from 'diagnostics_channel';
import { CONVERSATION_CHANNEL } from 'src/chat/entities/constants';

export const getHTMLFromWebsite = async (dto: ScraperDto) => {
  const pattern = /^((http|https|ftp):\/\/)/;
  let final_url = dto.url;
  if (!pattern.test(dto.url)) {
    final_url = 'https://' + dto.url;
  }
  const httpsAgent = new https.Agent({ keepAlive: true });
  try {
    const { data: html } = await axios.get(final_url, {
      httpsAgent,
      params: {
        cat_id: '876',
      },
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    httpsAgent.destroy();

    return html as string;
  } catch (e: any) {
    httpsAgent.destroy();

    throw new HttpException(
      'failed to get html please check url',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const extractTextFromHTML = (html: string) => {
  try {
    const options = {
      wordwrap: 130,
    };

    let text = convert(html, options);
    text = text.replace(/ *\[[^\]]*\] */g, '');
    if (text.length > 3900) {
      text = text.slice(0, 3901);
    }

    return { text };
  } catch (e: any) {
    throw new HttpException(
      'failed to get text please check HTML',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const extractMainColorFromHTML = (html: string) => {
  try {
    const regex = /#(?!000000|FFFFFF)[0-9a-f]{6}/gi;

    const countMap = {};
    const hexArray = html.match(regex);
    if (!hexArray) return;

    const filteredHexArray = [...new Set(hexArray)];

    filteredHexArray.forEach((hex) => {
      countMap[hex] = countMap[hex] ? countMap[hex] + 1 : 1;
    });

    let mostRepeatedHex = filteredHexArray?.[0];
    let maxCount = countMap?.[mostRepeatedHex];

    Object.entries(countMap).forEach(([hex, count]) => {
      if (count > maxCount) {
        mostRepeatedHex = hex;
        maxCount = count;
      }
    });

    return mostRepeatedHex;
  } catch (e: any) {
    throw new HttpException(
      'failed to get main color please check HTML',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const extractIconFromHTML = (html: string) => {
  try {
    const regex =
      /<link[^>]*rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*href="(https:\/\/[^"]*)"/i;
    const match = html.match(regex);
    if (!match) {
      return;
    }

    const icon = match[1];

    return icon;
  } catch (e: any) {
    throw new HttpException(
      'Failed to get icon. Please check URL.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
export const convertThreadToConversation = async (thread: any) => {
  if (thread) {
    return new Conversations({ channel: CONVERSATION_CHANNEL.EMAIL });
  }
};
