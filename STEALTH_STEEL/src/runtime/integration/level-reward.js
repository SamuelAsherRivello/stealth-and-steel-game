export function trophyForLevel(level) {
  if (![1,2,3].includes(level)) return null;
  return {name:`Achievement: Level ${level}`,ticker:`LVL${level}`,amount:'1',decimals:0,
    iconUrl:`https://samuelasherrivello.github.io/blockchain-integration-service/assets/achievements/v2/level-${level}-trophy.png`};
}

export function createLevelReward({accountHost,ui,progress,gold}) {
  let controller,unsubscribe,disposed=false,visible=false,initializing=false;
  const update=()=>{if(!disposed&&controller)ui.setState(controller.getState());};
  const navigation=action=>{
    if(disposed || controller?.getState().busy || controller?.getState().needsAcknowledgment)return;
    try{action();}catch{ui.setState({status:'error',busy:false,canCollect:false,canCheck:false,needsAcknowledgment:true,message:'Game progress could not be saved. Enable browser storage and try again.'});}
  };
  async function initialize() {
    if(disposed||initializing||controller)return;
    const asset=trophyForLevel(progress.current);
    if(!asset){ui.setState({status:'blocked',canCollect:false,canCheck:false,busy:false,message:'No trophy is configured for this level.'});return;}
    initializing=true;
    try{
      const current=await accountHost.createAssetCollection({asset,successMessage:`Level ${progress.current} Trophy collected!`});
      if(disposed){current.dispose();return;}controller=current;unsubscribe=controller.subscribe(update);update();await controller.refresh();
    }catch{if(!disposed)ui.setState({status:'error',canCollect:false,canCheck:true,busy:false,message:'Trophies are unavailable. Check again or continue.'});}
    finally{initializing=false;}
  }
  return {
    show(){if(visible||disposed)return;visible=true;ui.setCompletion({levelNumber:progress.current,levelsCompleted:progress.completed+1,totalLevels:progress.total,hasNext:progress.hasNext,collected:gold.collected,total:gold.total});ui.show();void initialize();},
    collect:()=>controller?.collect(),
    check:()=>controller?controller.check():initialize(),
    acknowledge(){if(controller)return controller.acknowledge();ui.setState({needsAcknowledgment:false,message:''});},
    next:()=>navigation(()=>progress.advance()),restart:()=>navigation(()=>progress.restart()),
    dispose(){disposed=true;unsubscribe?.();controller?.dispose();},
  };
}
