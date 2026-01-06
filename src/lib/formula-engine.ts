/**
 * Engine de Fórmulas Excel-like
 * Suporta: IF, AND, OR, SUM, COUNT, DATEDIFF, TODAY, PARAM
 */

export type FormulaContext = {
  animals?: Record<string, any>[];
  events?: Record<string, any>[];
  parameters?: Record<string, string | number | boolean>;
  currentAnimal?: Record<string, any>;
  currentDate?: Date;
};

type TokenType = 
  | 'NUMBER' 
  | 'STRING' 
  | 'BOOLEAN' 
  | 'FUNCTION' 
  | 'OPERATOR' 
  | 'PAREN' 
  | 'COMMA' 
  | 'FIELD' 
  | 'EOF';

interface Token {
  type: TokenType;
  value: string | number | boolean;
}

// Tokenizer
function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < formula.length) {
    const char = formula[i];
    
    // Whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    // Numbers
    if (/[\d.]/.test(char)) {
      let num = '';
      while (i < formula.length && /[\d.]/.test(formula[i])) {
        num += formula[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(num) });
      continue;
    }
    
    // Strings
    if (char === '"' || char === "'") {
      const quote = char;
      i++;
      let str = '';
      while (i < formula.length && formula[i] !== quote) {
        str += formula[i];
        i++;
      }
      i++; // closing quote
      tokens.push({ type: 'STRING', value: str });
      continue;
    }
    
    // Functions and identifiers
    if (/[a-zA-Z_]/.test(char)) {
      let name = '';
      while (i < formula.length && /[a-zA-Z_0-9]/.test(formula[i])) {
        name += formula[i];
        i++;
      }
      
      const upperName = name.toUpperCase();
      if (upperName === 'TRUE') {
        tokens.push({ type: 'BOOLEAN', value: true });
      } else if (upperName === 'FALSE') {
        tokens.push({ type: 'BOOLEAN', value: false });
      } else if (['IF', 'AND', 'OR', 'SUM', 'COUNT', 'COUNTIF', 'SUMIF', 'DATEDIFF', 'TODAY', 'PARAM', 'AVERAGE', 'MIN', 'MAX', 'ABS', 'ROUND'].includes(upperName)) {
        tokens.push({ type: 'FUNCTION', value: upperName });
      } else {
        tokens.push({ type: 'FIELD', value: name });
      }
      continue;
    }
    
    // Operators
    if (['=', '!', '<', '>', '+', '-', '*', '/', '%'].includes(char)) {
      let op = char;
      if (i + 1 < formula.length) {
        const next = formula[i + 1];
        if ((char === '=' && next === '=') ||
            (char === '!' && next === '=') ||
            (char === '<' && next === '=') ||
            (char === '>' && next === '=') ||
            (char === '<' && next === '>')) {
          op += next;
          i++;
        }
      }
      tokens.push({ type: 'OPERATOR', value: op });
      i++;
      continue;
    }
    
    // Parentheses
    if (char === '(' || char === ')') {
      tokens.push({ type: 'PAREN', value: char });
      i++;
      continue;
    }
    
    // Comma
    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }
    
    // Unknown character - skip
    i++;
  }
  
  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

// Parser and evaluator
class FormulaParser {
  private tokens: Token[];
  private pos: number = 0;
  private context: FormulaContext;
  
  constructor(tokens: Token[], context: FormulaContext) {
    this.tokens = tokens;
    this.context = context;
  }
  
  private current(): Token {
    return this.tokens[this.pos];
  }
  
  private advance(): Token {
    const token = this.current();
    this.pos++;
    return token;
  }
  
  private expect(type: TokenType, value?: string): Token {
    const token = this.current();
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(`Expected ${type} ${value || ''} but got ${token.type} ${token.value}`);
    }
    return this.advance();
  }
  
  parse(): any {
    return this.parseExpression();
  }
  
  private parseExpression(): any {
    return this.parseComparison();
  }
  
  private parseComparison(): any {
    let left = this.parseAdditive();
    
    while (this.current().type === 'OPERATOR' && 
           ['=', '==', '!=', '<>', '<', '>', '<=', '>='].includes(this.current().value as string)) {
      const op = this.advance().value as string;
      const right = this.parseAdditive();
      
      switch (op) {
        case '=':
        case '==':
          left = left === right;
          break;
        case '!=':
        case '<>':
          left = left !== right;
          break;
        case '<':
          left = left < right;
          break;
        case '>':
          left = left > right;
          break;
        case '<=':
          left = left <= right;
          break;
        case '>=':
          left = left >= right;
          break;
      }
    }
    
    return left;
  }
  
  private parseAdditive(): any {
    let left = this.parseMultiplicative();
    
    while (this.current().type === 'OPERATOR' && 
           ['+', '-'].includes(this.current().value as string)) {
      const op = this.advance().value as string;
      const right = this.parseMultiplicative();
      
      if (op === '+') left = (left ?? 0) + (right ?? 0);
      else left = (left ?? 0) - (right ?? 0);
    }
    
    return left;
  }
  
  private parseMultiplicative(): any {
    let left = this.parseUnary();
    
    while (this.current().type === 'OPERATOR' && 
           ['*', '/', '%'].includes(this.current().value as string)) {
      const op = this.advance().value as string;
      const right = this.parseUnary();
      
      if (op === '*') left = (left ?? 0) * (right ?? 0);
      else if (op === '/') left = right !== 0 ? (left ?? 0) / right : 0;
      else left = right !== 0 ? (left ?? 0) % right : 0;
    }
    
    return left;
  }
  
  private parseUnary(): any {
    if (this.current().type === 'OPERATOR' && this.current().value === '-') {
      this.advance();
      return -this.parsePrimary();
    }
    return this.parsePrimary();
  }
  
  private parsePrimary(): any {
    const token = this.current();
    
    switch (token.type) {
      case 'NUMBER':
        this.advance();
        return token.value;
        
      case 'STRING':
        this.advance();
        return token.value;
        
      case 'BOOLEAN':
        this.advance();
        return token.value;
        
      case 'FIELD':
        this.advance();
        return this.getFieldValue(token.value as string);
        
      case 'FUNCTION':
        return this.parseFunction();
        
      case 'PAREN':
        if (token.value === '(') {
          this.advance();
          const result = this.parseExpression();
          this.expect('PAREN', ')');
          return result;
        }
        break;
    }
    
    throw new Error(`Unexpected token: ${token.type} ${token.value}`);
  }
  
  private parseFunction(): any {
    const funcName = this.advance().value as string;
    this.expect('PAREN', '(');
    
    const args: any[] = [];
    
    if (this.current().type !== 'PAREN' || this.current().value !== ')') {
      args.push(this.parseExpression());
      
      while (this.current().type === 'COMMA') {
        this.advance();
        args.push(this.parseExpression());
      }
    }
    
    this.expect('PAREN', ')');
    
    return this.executeFunction(funcName, args);
  }
  
  private getFieldValue(fieldName: string): any {
    if (this.context.currentAnimal && fieldName in this.context.currentAnimal) {
      return this.context.currentAnimal[fieldName];
    }
    return null;
  }
  
  private executeFunction(name: string, args: any[]): any {
    switch (name) {
      case 'IF':
        return args[0] ? args[1] : (args[2] ?? null);
        
      case 'AND':
        return args.every(Boolean);
        
      case 'OR':
        return args.some(Boolean);
        
      case 'SUM':
        if (Array.isArray(args[0])) {
          return args[0].reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        }
        return args.reduce((sum, val) => sum + (Number(val) || 0), 0);
        
      case 'COUNT':
        if (Array.isArray(args[0])) {
          return args[0].filter(v => v != null).length;
        }
        return args.filter(v => v != null).length;
        
      case 'COUNTIF':
        // COUNTIF(array, condition)
        if (Array.isArray(args[0])) {
          return args[0].filter(v => v === args[1]).length;
        }
        return 0;
        
      case 'AVERAGE':
        if (Array.isArray(args[0])) {
          const nums = args[0].filter(v => typeof v === 'number');
          return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        }
        const validArgs = args.filter(v => typeof v === 'number');
        return validArgs.length > 0 ? validArgs.reduce((a, b) => a + b, 0) / validArgs.length : 0;
        
      case 'MIN':
        if (Array.isArray(args[0])) {
          return Math.min(...args[0].filter(v => typeof v === 'number'));
        }
        return Math.min(...args.filter(v => typeof v === 'number'));
        
      case 'MAX':
        if (Array.isArray(args[0])) {
          return Math.max(...args[0].filter(v => typeof v === 'number'));
        }
        return Math.max(...args.filter(v => typeof v === 'number'));
        
      case 'ABS':
        return Math.abs(args[0] ?? 0);
        
      case 'ROUND':
        const decimals = args[1] ?? 0;
        const factor = Math.pow(10, decimals);
        return Math.round((args[0] ?? 0) * factor) / factor;
        
      case 'TODAY':
        return this.context.currentDate || new Date();
        
      case 'DATEDIFF':
        const date1 = args[0] instanceof Date ? args[0] : new Date(args[0]);
        const date2 = args[1] instanceof Date ? args[1] : new Date(args[1]);
        const unit = (args[2] || 'days').toLowerCase();
        
        const diffMs = date2.getTime() - date1.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        switch (unit) {
          case 'days':
          case 'd':
            return diffDays;
          case 'months':
          case 'm':
            return Math.floor(diffDays / 30);
          case 'years':
          case 'y':
            return Math.floor(diffDays / 365);
          default:
            return diffDays;
        }
        
      case 'PARAM':
        const paramName = String(args[0]);
        if (this.context.parameters && paramName in this.context.parameters) {
          return this.context.parameters[paramName];
        }
        return null;
        
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }
}

/**
 * Avalia uma fórmula Excel-like
 */
export function evaluateFormula(formula: string, context: FormulaContext = {}): any {
  try {
    const tokens = tokenize(formula);
    const parser = new FormulaParser(tokens, {
      ...context,
      currentDate: context.currentDate || new Date(),
    });
    return parser.parse();
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return null;
  }
}

/**
 * Valida se uma fórmula é sintaticamente correta
 */
export function validateFormula(formula: string): { valid: boolean; error?: string } {
  try {
    const tokens = tokenize(formula);
    new FormulaParser(tokens, {}).parse();
    return { valid: true };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

/**
 * Extrai os campos referenciados em uma fórmula
 */
export function extractFormulaFields(formula: string): string[] {
  const tokens = tokenize(formula);
  return tokens
    .filter(t => t.type === 'FIELD')
    .map(t => t.value as string);
}

/**
 * Extrai os parâmetros referenciados em uma fórmula
 */
export function extractFormulaParams(formula: string): string[] {
  const params: string[] = [];
  const regex = /PARAM\s*\(\s*["']([^"']+)["']\s*\)/gi;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    params.push(match[1]);
  }
  return params;
}
