Q1.1: Yes, there is such a program.
Explanation:
In almost all cases, this conversion is possible except for the case of a standalone (define x val). While a define followed by other expressions can be transformed through substitution into the rest of the program, an isolated definition cannot be converted because L11 requires the program to be composed of expressions (<cexp>). A <define> statement is not a <cexp>; it is a declaration that mutates the global environment. Since L11 lacks the define form, it has no way to represent a global binding that does not have a subsequent body or expression to evaluate.

Q1.2: Yes, there is such a program.
Explanation:
In almost all cases, this conversion is possible except for the case of a standalone (define x val). In L2, a define followed by a body is typically transformed into an immediate lambda application — for example, (define x 5) (+ x 1) becomes ((lambda (x) (+ x 1)) 5). However, the grammar of a lambda expression requires its body to contain at least one expression (<cexp>+). If the program consists only of (define x val), there is no available <cexp> to serve as the body of the lambda, making the transformation into a valid L21 expression impossible.

Q1.3: No, there is not.
Explanation:
Every L2 program can be transformed into an equivalent L22 program  by addressing its two restrictions:  
Single Parameter Constraint: Functions with multiple parameters can be transformed using a technique called Currying. This converts a function that takes multiple arguments into a sequence of nested functions, each taking exactly one parameter.
Single Expression Body Constraint: Because L2 is a pure functional language without side effects (like mutations or printing), any expressions in a function body that come before the final expression do not affect the outcome of the program. Therefore, they can simply be removed, leaving only the final evaluated expression.
Since both restrictions can be resolved systematically without changing the program's behavior, every L2 program has an equivalent L22 program.

Q1.4:
Yes, there is.
Contradictory Example:
(define apply-dynamic (lambda (f x) (f x)))
Explanation:
In L2, functions are first-class citizens, allowing us to pass them as arguments to other functions. The crucial point is that the exact function passed as f can be determined dynamically at runtime, based on other conditions or calculations in the program (e.g., an if statement deciding whether to pass an addition or multiplication function).
Since L23 strictly allows only first-order functions, it forbids passing functions as arguments. Because the choice of f is made dynamically at runtime, we cannot statically "hardcode" or inline the specific function calls in L23 ahead of time. Therefore, this dynamic runtime behavior cannot be transformed to L23 without losing the program's core logic. 


Q1.5: Special forms are required because they follow non-standard evaluation rules, whereas primitive operators evaluate all their arguments before application (applicative order). Without them, we could not control the flow of execution or implement logic that requires skipping certain expressions.  
Example: The if special form  
If if were a primitive operator, both the "then" and "else" branches would be evaluated every time before the condition is even checked. This would cause infinite loops in recursive functions or trigger errors (such as division by zero) in branches that were intended to be ignored. 

Q1.6: No, a function body with multiple expressions is not required in pure functional programming because, without side effects, intermediate expressions do not influence the final result.  
Utility: Multiple expressions are useful in imperative or impure functional languages to allow for sequencing side effects (e.g., variable mutation or I/O) before returning a value.  
In L3: L3 supports multiple expressions (<cexp>+) in its grammar, but since it is a pure language without mutation, the values of all intermediate expressions are ignored, and only the final expression is returned as the result.

Q1.7: Lexical address is a coordinate system used to identify a variable's location within nested lexical scopes without using its identifier name. It is represented as a pair of values: (depth, index).  Depth: The number of scopes (or lambda levels) one must move outward from the current scope to reach the scope where the variable is declared.  Index: The zero-based position of the variable within the parameter list of that specific declaration scope.  Example:Consider the following L2 expression:(lambda (x y) (lambda (z) (+ x z)))  Inside the body of the innermost lambda (+ x z):The variable z is in the current scope (depth 0) and is the first parameter (index 0). Its lexical address is (0, 0).  The variable x is in the outer scope (depth 1) and is the first parameter (index 0). Its lexical address is (1, 0).  The variable y (if it were used) would have the lexical address (1, 1).  

Q1.8:PrimOp Advantage: Efficiency. Primitive operations can be executed directly as native functions by the interpreter, bypassing the overhead associated with environment creation or the substitution processes required for closures.  Closure Advantage: Uniformity. Representing primitives as closures allows the interpreter to treat all callable entities—whether user-defined or built-in—identically. This simplifies the evaluation logic for application expressions (AppExp) by removing the need for special-case handling of primitive operators. 

Q1.9
 a. From Applicative to Normal Order Reason: To avoid non-termination (divergence). Normal order only evaluates arguments if they are actually used in the function body.  Example: ((lambda (x y) x) 5 (infinite-loop)). In applicative order, the program will hang while trying to evaluate the loop. In normal order, it returns 5 and ignores the loop. 
 b. From Normal to Applicative Order Reason: Efficiency. Applicative order evaluates each argument exactly once before application. In normal order, if an argument appears multiple times in the body, it is re-evaluated every time it is encountered, which is computationally expensive.  Example: ((lambda (x) (+ x x)) (heavy-calculation)). In normal order, the heavy-calculation is performed twice. In applicative order, it is performed only once. 

 Q1.10: 
 a. The role of valueToLitExp: In the substitution model (L3-eval-sub.ts), the interpreter replaces variable names with their assigned values. Since the substitution is performed on the AST (the code structure), and the AST can only contain other expressions, valueToLitExp is used to wrap a computed Value back into a LitExp (AST) so it can be legally inserted into the code.  
b. Why it is not needed in Normal Order (L3-normal.ts): In normal order evaluation, we substitute expressions (ASTs) for variables before they are ever evaluated into values. Since we are substituting "code for code" (AST for AST), we never have a "Value" that needs to be converted back into an expression.  
c. Why it is not needed in the Environment Model: The environment model does not use substitution at all. Instead of rewriting the code, it keeps the code as is and looks up the value of variables in a separate data structure (the Environment). Since no values are being "pasted" into the AST, the conversion function is unnecessary. 

Q1.11
a. Why renaming is not required in the environment model: Renaming is not required because the environment model does not involve textual substitution or the movement of code fragments into new scopes. Instead, it uses a system of frames and environments to manage variable bindings. When a procedure is applied, the interpreter creates a new frame that explicitly maps parameter names to their values without altering the original AST. Since names are resolved by looking through a specific chain of environment frames rather than by textual replacement, there is no risk of "name capture," making renaming unnecessary. 
b. Is renaming required for substituting a "closed" term:  No, renaming is not required if the term being substituted is closed. Name capture only occurs when a free variable within the substituted term accidentally falls under the scope of a binder (like a lambda) with the same name in the target expression. Since a closed term contains no free variables by definition, there are no variables available to be "captured" by binders in the target scope. Consequently, the substitution can be performed safely without any renaming.



