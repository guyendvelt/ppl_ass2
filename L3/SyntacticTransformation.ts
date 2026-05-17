import { ClassExp, ProcExp, Exp, Program, VarDecl, CExp, makeProcExp, makeVarDecl, makeVarRef, makeLitExp, makeAppExp, makePrimOp, isProcExp, makeIfExp, Binding, isProgram, isAppExp, isBoolExp, isClassExp, isDefineExp, isIfExp, isLetExp, isLitExp, isNumExp, isPrimOp, isStrExp, isVarRef, makeBinding, makeClassExp, makeDefineExp, makeLetExp, makeProgram } from "./L3-ast";
import { Result, bind, makeFailure, makeOk, mapResult, mapv } from "../shared/result";
import { makeSymbolSExp } from "./L3-value";

/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp => {
    const msgVarDecl = makeVarDecl("msg");
    const msgVarRef = makeVarRef("msg");
    const errorLit = makeLitExp(makeSymbolSExp("error"));
    //create recursive function to build the If Chain:
    const buildIfChain = (methods: Binding[]): CExp => {
        //base case
        if (methods.length === 0) {
            return errorLit;
        }
        
        const currentMethod = methods[0];
        const methodSymbol = makeLitExp(makeSymbolSExp(currentMethod.var.var));
        const test = makeAppExp(makePrimOp("eq?"), [msgVarRef, methodSymbol]);
        const then = isProcExp(currentMethod.val) ? currentMethod.val.body[0] : currentMethod.val;
        const alt = buildIfChain(methods.slice(1));
        return makeIfExp(test, then, alt);
    };
    const args = exp.fields;
    const ifChain = buildIfChain(exp.methods);
    const innerProc = makeProcExp([msgVarDecl], [ifChain]);
    
    return makeProcExp(args, [innerProc]);
};
    

/*
Purpose: Transform all class forms in the given AST to procs
Signature: transform(AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

export const transform = (exp: Exp | Program): Result<Exp | Program> =>
    isProgram(exp) ? mapv(mapResult(transformExp, exp.exps), makeProgram) :
    transformExp(exp);

const transformExp = (exp: Exp): Result<Exp> =>
    isDefineExp(exp) ? mapv(transformCExp(exp.val), (val: CExp) => makeDefineExp(exp.var, val)) :
    transformCExp(exp);

const transformCExp = (exp: CExp): Result<CExp> =>
    isNumExp(exp) || isBoolExp(exp) || isStrExp(exp) || isPrimOp(exp) || isVarRef(exp) || isLitExp(exp) ? makeOk(exp) :
    isAppExp(exp) ? bind(transformCExp(exp.rator), (rator: CExp) =>
                        mapv(mapResult(transformCExp, exp.rands), (rands: CExp[]) => makeAppExp(rator, rands))) :
    isIfExp(exp) ? bind(transformCExp(exp.test), (test: CExp) =>
                       bind(transformCExp(exp.then), (then: CExp) =>
                            mapv(transformCExp(exp.alt), (alt: CExp) => makeIfExp(test, then, alt)))) :
    isProcExp(exp) ? mapv(mapResult(transformCExp, exp.body), (body: CExp[]) => makeProcExp(exp.args, body)) :
    isLetExp(exp) ? bind(mapResult((b: Binding) => mapv(transformCExp(b.val), (val: CExp) => makeBinding(b.var.var, val)), exp.bindings),
                         (bindings: Binding[]) => mapv(mapResult(transformCExp, exp.body), (body: CExp[]) => makeLetExp(bindings, body))) :
    isClassExp(exp) ? bind(mapResult((b: Binding) => mapv(transformCExp(b.val), (val: CExp) => makeBinding(b.var.var, val)), exp.methods),
                           (methods: Binding[]) => transformCExp(class2proc(makeClassExp(exp.fields, methods)))) :
    makeFailure(`Unknown expression type: ${exp}`);
