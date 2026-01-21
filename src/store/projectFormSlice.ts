// src/store/projectFormSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import type {  PayloadAction } from '@reduxjs/toolkit'

export interface MyFormProjectData {
  projectData: string
  siteData: string
  platformData: string 
  projectDirectory: string | null | undefined
}

const initialState: MyFormProjectData = {
  projectData: '',
  siteData: '',
  platformData: '',
  projectDirectory: '',
}

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setForm(_state, action: PayloadAction<MyFormProjectData>) {
      return action.payload
    },
  },
})

export const { setForm } = formSlice.actions
export default formSlice.reducer