
import { configureStore } from '@reduxjs/toolkit'
import form from './projectFormSlice' // adjust if your slice file has a different name

export const store = configureStore({
  reducer: { form },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
