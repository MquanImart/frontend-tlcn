export interface Report {
    _idReporter: string;
    reason: string;
    reportDate: string;
    status: 'pending'| 'accepted' | 'rejected'
  }
  