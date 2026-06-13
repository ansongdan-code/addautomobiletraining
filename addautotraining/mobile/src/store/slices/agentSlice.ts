import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  messages: [
    { role: 'assistant', content: "Hi! I'm your AddAuto Assistant. How can I help you with your automotive training today?" }
  ],
  isLoading: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  'agent/sendMessage',
  async (query: string, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const response = await axios.post(
      `${API_BASE_URL}/agent/chat`,
      { query },
      {
        headers: {
          Authorization: state.auth.token ? `Bearer ${state.auth.token}` : undefined
        }
      }
    );
    return response.data;
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.messages = initialState.messages;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          role: 'assistant',
          content: action.payload.data.answer
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get response';
        state.messages.push({
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now."
        });
      });
  }
});

export const { addMessage, clearChat } = agentSlice.actions;
export default agentSlice.reducer;
