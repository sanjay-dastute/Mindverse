import { combineReducers } from "redux";
import dashboardReducer from "./reducers/dashboardReducer";
import facebookReducer from "./reducers/facebookReducer";

//Root reducer of the project
export default function rootReducer() {
    return combineReducers({
        dashboardReducer,
        facebookReducer
    })
}