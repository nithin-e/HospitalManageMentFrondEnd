import { PayloadAction, ActionReducerMapBuilder } from "@reduxjs/toolkit";

// Reusable thunk handler
export const handleAsyncThunk = <T>(
  builder: ActionReducerMapBuilder<any>,
  asyncThunk: any,
  onSuccess?: (state: any, action: PayloadAction<T>) => void
) => {
  builder
  .addCase(asyncThunk.pending, (state: any) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(asyncThunk.fulfilled, (state: any, action: PayloadAction<T>) => {
    console.log('inside the addcase1', action.payload);
    
    // More careful assignment
    if (action.payload) {
      console.log('inside the addcase2', action.payload);
      // Check if this is a registration response
      if (asyncThunk.typePrefix === 'auth/register') {
        console.log('Processing registration response');
  
        state.user = action.payload;
        state.isUserAuthenticated = true; 
      } else {
       
        state.isUserAuthenticated = true;
        
      
        if ('id' in (action.payload as any) || 'email' in (action.payload as any)) {
          state.user = action.payload;
        } else if ((action.payload as any).user) {
          state.user = (action.payload as any).user;
        }
      }
    }
    
    state.loading = false;

    const payload = action.payload as any;
    
    // Token handling
    if (payload?.accessToken && payload?.refreshToken) {
      console.log('<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>',payload);
      
      const tokenPrefix = (payload.user?.role === 'admin' || payload.role === 'admin') ? 'admin' : 'user';
      localStorage.setItem(`${tokenPrefix}AccessToken`, payload.accessToken);
      localStorage.setItem(`${tokenPrefix}RefreshToken`, payload.refreshToken);
    }
    
    if (onSuccess && typeof onSuccess === "function") {
      onSuccess(state, action); 
    }
  })
  .addCase(asyncThunk.rejected, (state: any, action: PayloadAction<string | undefined>) => {
    state.loading = false;
    state.error = action.payload || "An unknown error occurred";
  });
};