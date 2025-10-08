export class InsufficientCreditError extends Error {
  required: number;
  available: number;
  shortfall?: number;

  constructor(params: {
    required: number;
    available: number;
    shortfall?: number;
  }) {
    super(
      `Insufficient credits: required=${params.required}, available=${params.available}, shortfall=${params.shortfall}`
    );
    this.required = params.required;
    this.available = params.available;
    this.shortfall = params.shortfall;
    this.name = "InsufficientCreditError";
  }
}
