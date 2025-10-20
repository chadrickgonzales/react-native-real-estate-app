import { Audio } from 'expo-av';
import { CallNotificationData, CallNotificationService } from './call-notifications';

export interface CallState {
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  isConnected: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isRecording: boolean;
  recording?: Audio.Recording;
  sound?: Audio.Sound;
}

export class CallManager {
  private callState: CallState = {
    isIncomingCall: false,
    isOutgoingCall: false,
    isConnected: false,
    isMuted: false,
    isSpeakerOn: false,
    isRecording: false,
  };

  private onCallStateChange?: (state: CallState) => void;
  private recording?: Audio.Recording;
  private sound?: Audio.Sound;
  private callTimer?: NodeJS.Timeout;
  private callDuration = 0;

  constructor(onCallStateChange?: (state: CallState) => void) {
    this.onCallStateChange = onCallStateChange;
    this.setupAudioMode();
  }

  private async setupAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error('Error setting up audio mode:', error);
    }
  }

  async startCall(): Promise<void> {
    try {
      console.log('Starting call...');
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Start recording
      await this.startRecording();
      
      // Update call state
      this.updateCallState({
        isOutgoingCall: true,
        isConnected: true,
        isRecording: true,
      });

      // Start call timer
      this.startCallTimer();

      console.log('Call started successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async answerCall(): Promise<void> {
    try {
      console.log('Answering call...');
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Start recording
      await this.startRecording();
      
      // Update call state
      this.updateCallState({
        isIncomingCall: false,
        isConnected: true,
        isRecording: true,
      });

      // Start call timer
      this.startCallTimer();

      console.log('Call answered successfully');
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  async declineCall(): Promise<void> {
    console.log('Declining call...');
    this.updateCallState({
      isIncomingCall: false,
      isOutgoingCall: false,
      isConnected: false,
    });
  }

  async endCall(): Promise<void> {
    try {
      console.log('Ending call...');
      
      // Stop recording
      await this.stopRecording();
      
      // Stop call timer
      this.stopCallTimer();
      
      // Update call state
      this.updateCallState({
        isIncomingCall: false,
        isOutgoingCall: false,
        isConnected: false,
        isRecording: false,
        recording: undefined,
        sound: undefined,
      });

      console.log('Call ended successfully');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  async toggleMute(): Promise<void> {
    try {
      if (!this.recording) return;

      const isMuted = !this.callState.isMuted;
      
      if (isMuted) {
        await this.recording.pauseAsync();
      } else {
        await this.recording.startAsync();
      }

      this.updateCallState({ isMuted });
      console.log(`Call ${isMuted ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }

  async toggleSpeaker(): Promise<void> {
    try {
      const isSpeakerOn = !this.callState.isSpeakerOn;
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !isSpeakerOn,
        staysActiveInBackground: true,
      });

      this.updateCallState({ isSpeakerOn });
      console.log(`Speaker ${isSpeakerOn ? 'on' : 'off'}`);
    } catch (error) {
      console.error('Error toggling speaker:', error);
    }
  }

  private async startRecording(): Promise<void> {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      
      this.recording = recording;
      this.updateCallState({ recording });
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  private async stopRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = undefined;
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  private startCallTimer(): void {
    this.callDuration = 0;
    this.callTimer = setInterval(() => {
      this.callDuration++;
      // You can emit call duration updates here if needed
    }, 1000);
  }

  private stopCallTimer(): void {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = undefined;
    }
  }

  private updateCallState(updates: Partial<CallState>): void {
    this.callState = { ...this.callState, ...updates };
    this.onCallStateChange?.(this.callState);
  }

  getCallState(): CallState {
    return this.callState;
  }

  getCallDuration(): number {
    return this.callDuration;
  }

  // Simulate incoming call (for testing)
  simulateIncomingCall(): void {
    this.updateCallState({
      isIncomingCall: true,
    });
  }
}

// Real call signaling using push notifications
export class CallSignaling {
  private static instance: CallSignaling;
  private callListeners: Map<string, (callData: any) => void> = new Map();
  private notificationService: CallNotificationService;
  private notificationSubscription?: any;

  static getInstance(): CallSignaling {
    if (!CallSignaling.instance) {
      CallSignaling.instance = new CallSignaling();
    }
    return CallSignaling.instance;
  }

  constructor() {
    this.notificationService = CallNotificationService.getInstance();
    this.setupNotificationListener();
  }

  private setupNotificationListener(): void {
    // Listen for notification responses (when user taps on call notification)
    this.notificationSubscription = this.notificationService.addNotificationResponseListener(
      (response) => {
        console.log('📞 Notification response received:', response);
        const data = response.notification.request.content.data;
        
        if (data && data.callId) {
          // Handle call notification tap
          this.handleCallNotificationResponse(data);
        }
      }
    );
  }

  private handleCallNotificationResponse(data: any): void {
    console.log('📞 Handling call notification response:', data);
    // This will be handled by the chat component
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      console.log('📞 Initializing call signaling...');
      await this.notificationService.initialize();
      console.log('📞 ✅ Call signaling initialized');
    } catch (error) {
      console.error('📞 Error initializing call signaling:', error);
    }
  }

  // Listen for incoming calls (now using notifications)
  listenForCalls(chatId: string, userId: string, onCall: (callData: any) => void): void {
    const key = `${chatId}-${userId}`;
    this.callListeners.set(key, onCall);
    console.log(`📞 User ${userId} listening for calls in chat ${chatId} (key: ${key})`);
  }

  // Stop listening for calls
  stopListening(chatId: string, userId: string): void {
    const key = `${chatId}-${userId}`;
    this.callListeners.delete(key);
    console.log(`📞 User ${userId} stopped listening for calls in chat ${chatId}`);
  }

  // Send real call notification
  async sendCallNotification(
    chatId: string, 
    fromUserId: string, 
    toUserId: string, 
    callData: CallNotificationData
  ): Promise<void> {
    try {
      console.log(`📞 Sending real call notification to user: ${toUserId}`);
      console.log(`📞 Call data:`, callData);

      const success = await this.notificationService.sendCallNotification(toUserId, callData);
      
      if (success) {
        console.log(`📞 ✅ Real call notification sent to ${toUserId}`);
      } else {
        console.error(`📞 ❌ Failed to send call notification to ${toUserId}`);
      }
    } catch (error) {
      console.error('📞 Error sending call notification:', error);
    }
  }

  // Send call response notification
  async sendCallResponseNotification(
    toUserId: string,
    callId: string,
    response: 'answered' | 'declined' | 'missed'
  ): Promise<void> {
    try {
      console.log(`📞 Sending call ${response} notification to: ${toUserId}`);
      
      const success = await this.notificationService.sendCallResponseNotification(
        toUserId,
        callId,
        response
      );
      
      if (success) {
        console.log(`📞 ✅ Call ${response} notification sent to ${toUserId}`);
      } else {
        console.error(`📞 ❌ Failed to send call ${response} notification to ${toUserId}`);
      }
    } catch (error) {
      console.error(`📞 Error sending call ${response} notification:`, error);
    }
  }

  // Handle incoming call from notification
  handleIncomingCall(callData: any): void {
    console.log('📞 Handling incoming call from notification:', callData);
    
    // Find the appropriate listener and trigger it
    const key = `${callData.chatId}-${callData.toUserId}`;
    const listener = this.callListeners.get(key);
    
    if (listener) {
      console.log('📞 ✅ Found listener, triggering call handler');
      listener(callData);
    } else {
      console.warn(`📞 ❌ No listener found for incoming call. Key: ${key}`);
      console.log(`📞 Available listeners:`, Array.from(this.callListeners.keys()));
    }
  }

  // Cleanup
  cleanup(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
      this.notificationSubscription = undefined;
    }
    this.callListeners.clear();
    console.log('📞 Call signaling cleaned up');
  }
}
