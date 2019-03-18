/* eslint-disable react/prop-types */

import * as React from 'react';

interface Props {
  store: any
}

class Providers extends React.Component<Props, {}, any> {
  loopContext(ctxs: any[]) {
    if (ctxs.length) {
      const Ctx = ctxs.shift();
      return (
        <Ctx.visitor.component>
          { this.loopContext(ctxs) }
        </Ctx.visitor.component>
      );
    } else {
      return (
        <>
          { this.props.children }
        </>
      );
    }
  }

  render() {
    const Ctxs = Object.keys(this.props.store).map(ctx => this.props.store[ctx]);
    return this.loopContext(Ctxs);
  }
}

export default Providers;
