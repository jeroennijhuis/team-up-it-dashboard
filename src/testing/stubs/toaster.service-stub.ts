import { ToasterService } from 'src/app/modules/toaster/toaster.service';

export const toasterServiceStub: Partial<ToasterService> = {
  // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-empty-function
  show(_message: string, _action?: string): void {},
};
