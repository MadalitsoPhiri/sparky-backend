export class EntityResponse {
  constructor(
    public statusCode: number,
    public data: any,
    public message: string,
  ) {}
}
