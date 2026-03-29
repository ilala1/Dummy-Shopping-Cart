/**
 * React 19's JSXElementConstructor only allows class constructors that extend
 * React.Component. React Native core components use host-compatible constructor
 * shapes; they are valid at runtime. Widen the constructor branch for tsc.
 */
import 'react';

declare module 'react' {
  type JSXElementConstructor<P> =
    | ((
        props: P,
      ) => React.ReactNode | Promise<React.ReactNode>)
    | (new (props: P, context: any) => React.Component<any, any, any>)
    | (new (props: P, context?: any) => any);
}
