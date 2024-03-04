import { ThreadListInterface } from './email_thread_list.interface';

export interface ThreadResponseInterface {
  nextPageToken: string;
  resultSizeEstimate: number;
  threads: ThreadListInterface[];
}
