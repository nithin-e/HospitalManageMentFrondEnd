// // util/adminHandleAsyncThunk.ts
// import { PayloadAction, ActionReducerMapBuilder, AsyncThunk } from "@reduxjs/toolkit";
// import { Draft } from "immer";

// // Generic handler for createAsyncThunk with improved type safety
// export const handleAsyncThunk = <T, State extends { loading: boolean; error: string | null }>(
//   builder: ActionReducerMapBuilder<State>,
//   asyncThunk: AsyncThunk<T, any, any>,
//   onSuccess?: (state: Draft<State>, action: PayloadAction<T>) => void
// ) => {
//   builder
//     .addCase(asyncThunk.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     })
//     .addCase(asyncThunk.fulfilled, (state, action: PayloadAction<T>) => {
//       state.loading = false;

//       if (onSuccess) {
//         onSuccess(state, action);
//       }
//     })
//     .addCase(asyncThunk.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string || "An unknown error occurred";
//     });
// };