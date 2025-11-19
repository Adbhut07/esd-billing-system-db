import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import createWebStorage from "redux-persist/lib/storage/createWebStorage"

// Create a noop storage for SSR
const createNoopStorage = () => {
  return {
    getItem(_key: string): Promise<null> {
      return Promise.resolve(null)
    },
    setItem(_key: string, _value: unknown): Promise<unknown> {
      return Promise.resolve(_value)
    },
    removeItem(_key: string): Promise<void> {
      return Promise.resolve()
    },
  }
}

// Use noop storage during SSR, real storage on client
const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage()
import authReducer from "./slices/authSlice"
import houseReducer from "./slices/houseSlice"
import electricityReducer from "./slices/electricitySlice"
import waterReducer from "./slices/waterSlice"
import billReducer from "./slices/billSlice"
import adminReducer from "./slices/adminSlice"
import mohallaReducer from "./slices/mohallaSlice"
import settingsReducer from "./slices/settingsSlice"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
}

const rootReducer = combineReducers({
  auth: authReducer,
  house: houseReducer,
  electricity: electricityReducer,
  water: waterReducer,
  bill: billReducer,
  admin: adminReducer,
  mohalla: mohallaReducer,
  settings: settingsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
