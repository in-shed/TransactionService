
/**
 * ResourceNotFoundError representerar ett fel som uppstår när en resurs inte hittas.
 */
export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * BusinessError representerar ett affärslogikfel som kan uppstå under operationer i applikationen.
 */
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}