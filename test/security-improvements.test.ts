import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  sanitizeCommand, 
  validateCommand, 
  escapePasswordForShell,
  auditLog 
} from '../src/index';

// Mock console.error for audit logging
const mockConsoleError = vi.fn();
global.console.error = mockConsoleError;

describe('Security Improvements', () => {
  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.SSH_COMMAND_WHITELIST;
    delete process.env.SSH_COMMAND_BLACKLIST;
    mockConsoleError.mockClear();
  });

  describe('Command Validation', () => {
    it('should allow commands when whitelist is not set', () => {
      expect(() => validateCommand('ls -la')).not.toThrow();
    });

    it('should allow commands in whitelist', () => {
      process.env.SSH_COMMAND_WHITELIST = 'ls,cat,^grep.*';
      expect(() => validateCommand('ls -la')).not.toThrow();
      expect(() => validateCommand('cat file.txt')).not.toThrow();
      expect(() => validateCommand('grep pattern file')).not.toThrow();
    });

    it('should block commands not in whitelist', () => {
      process.env.SSH_COMMAND_WHITELIST = 'ls,cat';
      expect(() => validateCommand('rm -rf /')).toThrow('not in the whitelist');
    });

    it('should block commands in blacklist', () => {
      process.env.SSH_COMMAND_BLACKLIST = 'rm,^sudo.*,shutdown';
      expect(() => validateCommand('rm -rf /')).toThrow('blocked by the blacklist');
      expect(() => validateCommand('sudo ls')).toThrow('blocked by the blacklist');
      expect(() => validateCommand('shutdown now')).toThrow('blocked by the blacklist');
    });

    it('should allow commands not in blacklist', () => {
      process.env.SSH_COMMAND_BLACKLIST = 'rm,shutdown';
      expect(() => validateCommand('ls -la')).not.toThrow();
      expect(() => validateCommand('cat file.txt')).not.toThrow();
    });
  });

  describe('Password Escaping', () => {
    it('should properly escape passwords with special characters', () => {
      const password1 = "test'password";
      const escaped1 = escapePasswordForShell(password1);
      expect(escaped1).toBe('dGVzdCdwYXNzd29yZA==');
      
      const password2 = 'password$with"special';
      const escaped2 = escapePasswordForShell(password2);
      expect(escaped2).toBe('cGFzc3dvcmQkd2l0aCJzcGVjaWFs');
    });

    it('should handle empty passwords', () => {
      const escaped = escapePasswordForShell('');
      expect(escaped).toBe('');
    });

    it('should handle unicode passwords', () => {
      const password = '密碼123';
      const escaped = escapePasswordForShell(password);
      // Update expected value based on actual base64 encoding
      expect(escaped).toBe('5a+G56K8MTIz');
    });
  });

  describe('Audit Logging', () => {
    it('should log command execution', () => {
      auditLog('INFO', 'command_execution', { 
        command: 'ls -la',
        tool: 'exec',
        user: 'testuser',
        host: 'testhost'
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"level":"INFO"')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"event":"command_execution"')
      );
      // The details are JSON stringified, so check the full string
      const logOutput = mockConsoleError.mock.calls[0][0];
      expect(logOutput).toContain('ls -la');
      expect(logOutput).toContain('exec');
    });

    it('should log errors', () => {
      auditLog('ERROR', 'authentication_failed', { 
        reason: 'invalid password'
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"level":"ERROR"')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"event":"authentication_failed"')
      );
    });

    it('should log warnings', () => {
      auditLog('WARN', 'suspicious_command', { 
        command: 'rm -rf /'
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"level":"WARN"')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"event":"suspicious_command"')
      );
    });
  });

  describe('Command Sanitization', () => {
    it('should trim whitespace', () => {
      expect(sanitizeCommand('  ls -la  ')).toBe('ls -la');
    });

    it('should reject empty commands', () => {
      expect(() => sanitizeCommand('')).toThrow('cannot be empty');
      expect(() => sanitizeCommand('   ')).toThrow('cannot be empty');
    });

    it('should reject non-string commands', () => {
      expect(() => sanitizeCommand(null as any)).toThrow('must be a string');
      expect(() => sanitizeCommand(123 as any)).toThrow('must be a string');
    });
  });
});
