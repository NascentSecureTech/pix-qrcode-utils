export type xValidationRule<CTX={}> = ( context: CTX, v: RuleValidator<CTX> ) => void | ValidationResult | Promise<ValidationResult>;

export interface RuleDescription<CTX> {
  id: string;
  description?: string;
  when?: ( context: CTX, v: RuleValidator<CTX> ) => boolean | Promise<boolean>;
  rule?: ( context: CTX, v: RuleValidator<CTX> ) => void | ValidationResult | Promise<ValidationResult>;
}

export class ValidationError<EC=any> extends Error {
  errorName: string = "";

  constructor( public errorCode: EC, message?: string ) {
    super( message );
  }
}

export type ValidationResult = {
  status: "none" | "not-applicable" | "running" | "pass" | "inconclusive" | "fail";

  error?: ValidationError;
}

export type ValidationObserver = ( v: RuleValidator<any>, result: ValidationResult ) => void;

export class RuleValidator<CTX> {
  // ruleInfo: RuleInformation;

  parent?: RuleValidator<any>;
  protected childValidators: RuleValidator<CTX>[] = [];

  constructor( public ruleInfo: RuleDescription<CTX> ) {
  }

  static get<CTX>( info: RuleDescription<CTX> ): RuleValidator<CTX> {
    let v = new RuleValidator<CTX>( info );

    return v;
  }

  addRule( info: RuleDescription<CTX> ): this {
    return this.addValidator( RuleValidator.get( info ) );
  }

  addValidator( rule: RuleValidator<CTX> ): this {
    rule.parent = this;

    this.childValidators.push( rule );

    return this;
  }

  result: ValidationResult = {
    status: "none"
  };

  protected handleResult( res: ValidationResult, observer?: ValidationObserver, isFinal: boolean = false ): ValidationResult {
    const previousStatus = this.result.status;

    switch( res.status ) {
      case "none":
      case "not-applicable":
      case "running":
        this.result = res;
        break;

      case "pass":
        if ( isFinal && this.result.status == "running" ) {
          this.result = res;
        }
        break;

      case "inconclusive":
        if ( this.result.status != "fail" ) {
          this.result = res;
        }
        break;

      case "fail":
        if ( this.result.status != "fail" ) {
          this.result = res;
        }
        break;
    }

    if ( observer && ( previousStatus != this.result.status ) )
      observer( this, this.result );

    return this.result;
  }

  protected async executeRule( context: CTX ): Promise<ValidationResult> {
    let result: ValidationResult = { status: "pass" };

    if ( this.ruleInfo.rule ) {
      try {
        let res = this.ruleInfo.rule( context, this );

        if ( res ) {
          result = ( res instanceof Promise ) ? await Promise.resolve<ValidationResult>( res ) : res;
        }
      }
      catch( E ) {
        result = {
          status: "fail",
          error: ( E instanceof ValidationError ) ? E : new ValidationError( E )
        };
      }
    }

    return result;
  }

  async validate( context: CTX, observer?: ValidationObserver ): Promise<ValidationResult> {
    this.result = { status: "none" };

    let shouldExec = !this.ruleInfo.when || this.ruleInfo.when( context, this );

    if (shouldExec) {
      // Reset result status
      this.handleResult( { status: "running" }, observer );


      if ( this.ruleInfo.rule ) {
        this.handleResult( await this.executeRule( context ), observer );
      }

      for( let child of this.childValidators ) {
        if ( this.result.status != "running" )
          break;

        let childResult = await child.validate( context, observer );

        // Propagate child errors to me
        this.handleResult( childResult, observer );
      }

      if ( this.result.status == "running" )
        this.handleResult( { status: "pass" }, observer, true );

    }
    else {
      this.handleResult( { status: "not-applicable" }, observer, true );
    }

    return this.result;
  }
}
