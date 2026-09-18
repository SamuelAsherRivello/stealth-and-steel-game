/** Game-owned loss lifecycle. BIS owns price, payment, toast and result delivery. */
export function createPayToContinue({ accountHost, ui, restart }) {
  let generation = 0, disposed = false, controller, unsubscribe;
  const clear = () => { unsubscribe?.(); controller?.dispose(); controller = undefined; unsubscribe = undefined; };
  return {
    async show() {
      if (disposed) return;
      const current = ++generation; clear();
      ui.setState({sats:null,canPay:false,status:'idle',message:'Loading payment service…'}); ui.show();
      try {
        const next = await accountHost.createContinue({onEffectReceipt(receipt) {
          if (disposed || current !== generation) return;
          if (receipt.status !== 'applied') return;
          // Invalidate delivery before changing the loss UI, even if a receipt is replayed.
          generation++;
          ui.hide();
          clear();
        }});
        if (disposed || current !== generation) { next.dispose(); return; }
        controller = next;
        const refresh = () => ui.setState(next.getState());
        unsubscribe = next.subscribe(refresh); refresh();
      } catch {
        if (!disposed && current === generation) ui.setState({sats:null,canPay:false,status:'failed',message:'Payment service is unavailable. You can restart for free.'});
      }
    },
    pay() { return controller?.pay(); },
    restart() {
      if (disposed || controller?.getState().status === 'pending') return;
      generation++; clear(); restart();
    },
    dispose() { disposed = true; generation++; clear(); },
  };
}
