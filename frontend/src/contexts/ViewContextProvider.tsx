import React, { useState } from "react";
import * as enums from '../enums'

interface Props {
  children: any;
}

export const ViewContext = React.createContext({
  view: enums.View.spaceCoin,
  setView: (arg: string) => {}
});

export function ViewContextProvider(props: Props) {

  const [view, setView] = useState(enums.View.spaceCoin);

  return (
    <ViewContext.Provider value={{view: view, setView: setView}}>
          {props.children}
    </ViewContext.Provider>
  )

}