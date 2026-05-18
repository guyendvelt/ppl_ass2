import { 
    Exp, Program, CExp, 
    isProgram, isDefineExp, isNumExp, isBoolExp, isStrExp, isPrimOp, isVarRef, 
    isAppExp, isIfExp, isProcExp, 
    AppExp
} from "./L3/L3-ast"
import { Result, makeOk, makeFailure, bind, mapResult, mapv } from "./shared/result";

/*
Purpose: Transform a given L2 AST to a Python program string
Signature: L2ToPython(exp)
Type: [Exp | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string> =>
    isProgram(exp) ? mapv(mapResult(l2ToPythonExp, exp.exps), (exps: string[]) => exps.join("\n")) :
    l2ToPythonExp(exp);

const l2ToPythonExp = (exp: Exp): Result<string> =>
    isDefineExp(exp) ? mapv(l2ToPythonCExp(exp.val), (val: string) => `${exp.var.var} = ${val}`) : 
    l2ToPythonCExp(exp);

const l2ToPythonCExp = (exp: CExp): Result<string> => 
    isNumExp(exp) ? makeOk(exp.val.toString()) : 
    isBoolExp(exp) ? makeOk(exp.val ? "True" : "False") :
    isStrExp(exp) ? makeOk(`"${exp.val}"`) : 
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(convertPrimOp(exp.op)) :
    isIfExp(exp) ? bind(l2ToPythonCExp(exp.test), (test: string) =>
                    bind(l2ToPythonCExp(exp.then), (then: string) =>
                    mapv(l2ToPythonCExp(exp.alt), (alt: string) =>
                    `(${then} if ${test} else ${alt})`
                )
            )
        ) :
    isProcExp(exp) ? mapv(l2ToPythonCExp(exp.body[0]), (bodyStr: string) =>
            `(lambda ${exp.args.map(arg => arg.var).join(",")} : ${bodyStr})`
        ) :
    isAppExp(exp) ? appExpToPython(exp) :
              makeFailure(`Unknown L2 expression type: ${exp}`)

// מיפוי של אופרטורים פרימיטיביים משפת L2 לשפת פייתון
const convertPrimOp = (op: string): string => {
    if (op === "=" || op === "eq?") return "==";
    if (op === "and") return "and";
    if (op === "or") return "or";
    if (op === "not") return "not";
    if (op === "number?") return "(lambda x: (type(x) == int or type(x) == float))";
    if (op === "boolean?") return "(lambda x: (type(x) == bool))";
    return op; 
};

// זיהוי אופרטורים שצריכים להיכתב בצורה אינפיקסית (Infix) בפייתון
const isBinaryOrLogicalOp = (op: string): boolean =>
    ["+", "-", "*", "/", "<", ">", "=", "eq?", "and", "or", "not"].includes(op);

const appExpToPython = (exp : AppExp) : Result<string> => {
            const op = exp.rator;
            if(isPrimOp(op) && isBinaryOrLogicalOp(op.op)){
                if(op.op === "not"){
                    return mapv(l2ToPython(exp.rands[0]), (rand : string) => `(not ${rand})`)
                }
                 return bind(l2ToPythonCExp(exp.rator), (rator : string) =>
                    mapv(mapResult(l2ToPythonCExp, exp.rands), (rands : string[]) =>
                    `(${rands.join(` ${rator} `)})`
                    )
                )
            }
            return bind(l2ToPythonCExp(exp.rator), (rator : string) => 
            mapv(mapResult(l2ToPythonCExp, exp.rands), (rands : string[]) =>
            `${rator}(${rands.join(",")})`
            )
            )

}
     