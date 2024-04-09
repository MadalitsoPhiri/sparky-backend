import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as https from 'https';
import axios from 'axios';
import { convert } from 'html-to-text';
import { ScraperDto } from 'src/spark-gpt/entities/dtos/scrapper_dto';
import { Conversations, Messages } from 'src/chat/entities/schema';
import { channel } from 'diagnostics_channel';
import { CONVERSATION_CHANNEL, EMAIL_REQUIRED_STATUS } from 'src/chat/entities/constants';
import { Availability } from 'src/auth/entities';
import { AvailabilityDay } from 'src/auth/entities/types/availability';

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

export const convertTime12to24 = (time12h) => {
  const [time, modifier] = time12h.split(' ');

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
}

export const getIsWorking = (email_required: string, availability: Availability) => {
  Logger.log('email_req:', email_required);
  Logger.log('availability:', availability);
  
  if (email_required != EMAIL_REQUIRED_STATUS.OFFICE_HOURS) {
    return;
  }

  const office_hours = availability.officeHours[0];
  const is_everyday = office_hours.openDay === AvailabilityDay.EVERYDAY;
  const is_weekdays = office_hours.openDay === AvailabilityDay.WEEKDAYS;
  const is_weekends = office_hours.openDay === AvailabilityDay.WEEKENDS;

  const hours = {
    openTime: office_hours.openTime,
    closeTime: office_hours.closeTime,
  };

  let work_hours = [];

  if (is_everyday) {
    work_hours = [
      AvailabilityDay.MONDAY,
      AvailabilityDay.TUESDAY,
      AvailabilityDay.WEDNESDAY,
      AvailabilityDay.THURSDAY,
      AvailabilityDay.FRIDAY,
      AvailabilityDay.SATURDAY,
      AvailabilityDay.SUNDAY,
    ].map(day => ({
      openDay: day,
      ...hours,
    }));
  } else if (is_weekdays) {
    work_hours = [
      AvailabilityDay.MONDAY,
      AvailabilityDay.TUESDAY,
      AvailabilityDay.WEDNESDAY,
      AvailabilityDay.THURSDAY,
      AvailabilityDay.FRIDAY,
    ].map(day => ({
      openDay: day,
      ...hours,
    }));
  } else if (is_weekends) {
    work_hours = [
      AvailabilityDay.SATURDAY,
      AvailabilityDay.SUNDAY,
    ].map(day => ({
      openDay: day,
      ...hours,
    }));
  }

  Logger.log('Days:', work_hours.map(d => d.openDay));

  const localTimeZone = 'America/Toronto';

  const now = new Date();

  const currentDayInWeek = now.toLocaleString("en-US", {
    timeZone: localTimeZone,
    weekday: 'long'
  });
  const currentTime = new Intl.DateTimeFormat([], {
    timeZone: localTimeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);
  
  Logger.log('Day:', currentTime);

  const workingTimes = work_hours.filter(times => times.openDay?.toLocaleLowerCase() === currentDayInWeek?.toLocaleLowerCase());

  Logger.log('Day:', workingTimes.map(d => d.openDay));

  return workingTimes.some((time) => {
    const openTime = (time.openTime);
    const closeTime = (time.closeTime);

    Logger.log('Open Time:', openTime);    
    Logger.log('Close Time:', closeTime);    
    Logger.log('Compare Time:', currentTime);    

    if (currentTime >= time.openTime && currentTime <= time.closeTime) return true;

    return false;
  });
}