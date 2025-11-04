import { 
  PayloadAction, 
  ActionReducerMapBuilder, 
  AsyncThunk 
} from "@reduxjs/toolkit";


interface DoctorState {
  loading: boolean;
  error: string | null;
  [key: string]: any;
}

/**
 * Reusable thunk handler for doctor slice
 * @param builder - The builder from createSlice's extraReducers
 * @param asyncThunk - The async thunk to handle
 * @param stateKey - The key in state where results will be stored (default: 'data')
 * @param onSuccess - Optional callback for successful responses
 */
export const handleDoctorAsyncThunk = <ThunkArg, ThunkReturn>(
  builder: ActionReducerMapBuilder<DoctorState>,
  asyncThunk: AsyncThunk<ThunkReturn, ThunkArg, {}>,
  stateKey: string = "data",
  onSuccess?: (state: DoctorState, action: PayloadAction<ThunkReturn>) => void
) => {
  builder
    .addCase(asyncThunk.pending, (state: DoctorState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(asyncThunk.fulfilled, (state: DoctorState, action: PayloadAction<ThunkReturn>) => {
      const payload: any = action.payload;

      if (payload && typeof payload === "object" && "data" in payload) {
        console.log('check the payload inside the asyncThank',payload);
        
        state[stateKey] = payload.data;
      } else {
        state[stateKey] = payload;
      }

      state.loading = false;

      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(state, action);
      }
    })
    .addCase(asyncThunk.rejected, (state: DoctorState, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "An unknown error occurred";
    });
};
