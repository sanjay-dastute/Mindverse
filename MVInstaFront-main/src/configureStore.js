import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

//Redux store
const store = configureStore({
    reducer: rootReducer({})
})

export default store;