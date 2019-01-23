/* eslint-disable react/prop-types */

import React from 'react';

class Providers extends React.Component {
  loopContext(ctxs) {
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
