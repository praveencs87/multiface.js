import { MultiModalInput, FusedInput } from '../types';

export interface FusionLogEntry {
  timestamp: number;
  type: 'input' | 'fusion' | 'conflict' | 'error';
  data: any;
  metadata?: Record<string, any>;
}

export class FusionLogger {
  private logs: FusionLogEntry[] = [];
  private maxLogs: number;
  private enableConsoleLogging: boolean;

  constructor(maxLogs: number = 1000, enableConsoleLogging: boolean = false) {
    this.maxLogs = maxLogs;
    this.enableConsoleLogging = enableConsoleLogging;
  }

  logInput(input: MultiModalInput): void {
    const logEntry: FusionLogEntry = {
      timestamp: Date.now(),
      type: 'input',
      data: {
        id: input.id,
        type: input.type,
        dataPreview: this.truncateData(input.data),
        priority: input.priority,
        confidence: input.confidence
      },
      metadata: input.metadata
    };

    this.addLog(logEntry);

    if (this.enableConsoleLogging) {
      console.log(`[FUSION INPUT] ${input.type}:`, input.data);
    }
  }

  logFusion(fusedInput: FusedInput): void {
    const logEntry: FusionLogEntry = {
      timestamp: Date.now(),
      type: 'fusion',
      data: {
        id: fusedInput.id,
        inputTypes: fusedInput.originalInputs.map(i => i.type),
        fusedDataPreview: this.truncateData(fusedInput.fusedData),
        confidence: fusedInput.confidence,
        originalInputCount: fusedInput.originalInputs.length
      },
      metadata: fusedInput.metadata
    };

    this.addLog(logEntry);

    if (this.enableConsoleLogging) {
      console.log(`[FUSION OUTPUT] ${fusedInput.originalInputs.map(i => i.type).join('+')}:`, fusedInput.fusedData);
    }
  }

  logConflict(conflictingInputs: MultiModalInput[], resolution: string): void {
    const logEntry: FusionLogEntry = {
      timestamp: Date.now(),
      type: 'conflict',
      data: {
        conflictingTypes: conflictingInputs.map(i => i.type),
        resolution,
        inputCount: conflictingInputs.length
      }
    };

    this.addLog(logEntry);

    if (this.enableConsoleLogging) {
      console.warn(`[FUSION CONFLICT] ${conflictingInputs.map(i => i.type).join(' vs ')} - Resolved: ${resolution}`);
    }
  }

  logError(error: Error, context?: string): void {
    const logEntry: FusionLogEntry = {
      timestamp: Date.now(),
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack,
        context
      }
    };

    this.addLog(logEntry);

    if (this.enableConsoleLogging) {
      console.error(`[FUSION ERROR] ${context || 'Unknown'}:`, error);
    }
  }

  private addLog(logEntry: FusionLogEntry): void {
    this.logs.push(logEntry);

    // Keep logs within limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private truncateData(data: any, maxLength: number = 100): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  getLogs(type?: FusionLogEntry['type'], limit?: number): FusionLogEntry[] {
    let filteredLogs = type ? this.logs.filter(log => log.type === type) : this.logs;
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  getStats(): {
    totalLogs: number;
    inputCount: number;
    fusionCount: number;
    conflictCount: number;
    errorCount: number;
    inputTypeBreakdown: Record<string, number>;
  } {
    const inputLogs = this.logs.filter(log => log.type === 'input');
    const fusionLogs = this.logs.filter(log => log.type === 'fusion');
    const conflictLogs = this.logs.filter(log => log.type === 'conflict');
    const errorLogs = this.logs.filter(log => log.type === 'error');

    const inputTypeBreakdown: Record<string, number> = {};
    inputLogs.forEach(log => {
      const inputType = log.data.type;
      inputTypeBreakdown[inputType] = (inputTypeBreakdown[inputType] || 0) + 1;
    });

    return {
      totalLogs: this.logs.length,
      inputCount: inputLogs.length,
      fusionCount: fusionLogs.length,
      conflictCount: conflictLogs.length,
      errorCount: errorLogs.length,
      inputTypeBreakdown
    };
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  enableConsoleOutput(): void {
    this.enableConsoleLogging = true;
  }

  disableConsoleOutput(): void {
    this.enableConsoleLogging = false;
  }
}
