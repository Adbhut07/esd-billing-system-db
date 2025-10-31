import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import houseReducer from "./slices/houseSlice"
import electricityReducer from "./slices/electricitySlice"
import waterReducer from "./slices/waterSlice"
import billReducer from "./slices/billSlice"
import adminReducer from "./slices/adminSlice"
import mohallaReducer from "./slices/mohallaSlice"
import settingsReducer from "./slices/settingsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    house: houseReducer,
    electricity: electricityReducer,
    water: waterReducer,
    bill: billReducer,
    admin: adminReducer,
    mohalla: mohallaReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
