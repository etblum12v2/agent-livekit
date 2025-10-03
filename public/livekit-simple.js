// Simple LiveKit loader that properly exposes the global
console.log('Loading LiveKit with proper global exposure...');

// Load the LiveKit library
const script = document.createElement('script');
script.src = 'https://unpkg.com/livekit-client@2.15.8/dist/livekit-client.umd.js';

script.onload = function() {
    console.log('LiveKit script loaded, checking for global exposure...');
    
    // Wait for the script to fully initialize
    setTimeout(() => {
        console.log('Checking global objects...');
        console.log('window.LiveKit:', typeof window.LiveKit);
        console.log('window.LivekitClient:', typeof window.LivekitClient);
        console.log('globalThis.LiveKit:', typeof globalThis.LiveKit);
        console.log('LiveKit:', typeof LiveKit);
        
        // Check if LiveKit is available in any form
        let LiveKitObj = null;
        
        // Try different ways to access LiveKit
        if (typeof window.LivekitClient !== 'undefined') {
            LiveKitObj = window.LivekitClient;
            console.log('Found LivekitClient on window');
        } else if (typeof window.LiveKit !== 'undefined') {
            LiveKitObj = window.LiveKit;
            console.log('Found LiveKit on window');
        } else if (typeof globalThis.LiveKit !== 'undefined') {
            LiveKitObj = globalThis.LiveKit;
            console.log('Found LiveKit on globalThis');
        } else if (typeof LiveKit !== 'undefined') {
            LiveKitObj = LiveKit;
            console.log('Found LiveKit as global');
        } else {
            // Check if it's available through module.exports or define
            console.log('Checking module patterns...');
            
            // Try CommonJS pattern
            if (typeof module !== 'undefined' && module.exports) {
                console.log('module.exports:', typeof module.exports);
                if (module.exports && typeof module.exports === 'object') {
                    LiveKitObj = module.exports;
                    console.log('Found LiveKit in module.exports');
                }
            }
            
            // Try AMD pattern
            if (typeof define === 'function' && define.amd) {
                console.log('AMD environment detected');
            }
            
            // Check if it's attached to window in a different way
            for (let key in window) {
                if (key.toLowerCase().includes('livekit') || 
                    (typeof window[key] === 'object' && window[key] && 
                     typeof window[key].Room === 'function')) {
                    console.log(`Found potential LiveKit object: ${key}`, window[key]);
                    LiveKitObj = window[key];
                    break;
                }
            }
            
            // Special check for LivekitClient
            if (!LiveKitObj && typeof window.LivekitClient !== 'undefined') {
                console.log('Found LivekitClient on window');
                LiveKitObj = window.LivekitClient;
            }
        }
        
        if (LiveKitObj) {
            console.log('LiveKit object found:', LiveKitObj);
            console.log('LiveKit.Room:', typeof LiveKitObj.Room);
            
            // Ensure it's globally accessible with both names
            window.LiveKit = LiveKitObj;
            window.LivekitClient = LiveKitObj; // Ensure this name is also available
            globalThis.LiveKit = LiveKitObj;
            globalThis.LivekitClient = LiveKitObj;
            
            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('livekitReady', { 
                detail: { LiveKit: LiveKitObj } 
            }));
            
            console.log('LiveKit is now globally available as both LiveKit and LivekitClient');
        } else {
            console.error('LiveKit object not found, trying local file...');
            
            // Try local file as fallback
            const localScript = document.createElement('script');
            localScript.src = '/livekit-client.umd.js';
            localScript.onload = function() {
                console.log('Local LiveKit script loaded');
                setTimeout(() => {
                    // Check again after local file loads
                    if (typeof window.LiveKit !== 'undefined') {
                        console.log('Local LiveKit found on window');
                        window.dispatchEvent(new CustomEvent('livekitReady', { 
                            detail: { LiveKit: window.LiveKit } 
                        }));
                    } else {
                        console.error('LiveKit still not available after local fallback');
                        // Try to manually expose it
                        try {
                            // Some UMD builds might need manual exposure
                            if (typeof define === 'function' && define.amd) {
                                // AMD environment
                                console.log('Attempting AMD exposure');
                            } else if (typeof module !== 'undefined' && module.exports) {
                                // CommonJS
                                console.log('Attempting CommonJS exposure');
                                window.LiveKit = module.exports;
                                globalThis.LiveKit = module.exports;
                                
                                if (typeof window.LiveKit !== 'undefined') {
                                    console.log('Successfully exposed LiveKit from module.exports');
                                    window.dispatchEvent(new CustomEvent('livekitReady', { 
                                        detail: { LiveKit: window.LiveKit } 
                                    }));
                                }
                            }
                        } catch (e) {
                            console.error('Error trying to manually expose LiveKit:', e);
                        }
                    }
                }, 100);
            };
            localScript.onerror = function() {
                console.error('Failed to load local LiveKit file');
            };
            document.head.appendChild(localScript);
        }
    }, 200);
};

script.onerror = function() {
    console.error('Failed to load LiveKit from CDN, trying local file...');
    
    const localScript = document.createElement('script');
    localScript.src = '/livekit-client.umd.js';
    localScript.onload = function() {
        console.log('Local LiveKit script loaded');
        setTimeout(() => {
            if (typeof window.LiveKit !== 'undefined') {
                console.log('Local LiveKit found on window');
                window.dispatchEvent(new CustomEvent('livekitReady', { 
                    detail: { LiveKit: window.LiveKit } 
                }));
            } else if (typeof module !== 'undefined' && module.exports) {
                console.log('Exposing LiveKit from module.exports');
                window.LiveKit = module.exports;
                globalThis.LiveKit = module.exports;
                window.dispatchEvent(new CustomEvent('livekitReady', { 
                    detail: { LiveKit: window.LiveKit } 
                }));
            } else {
                console.error('LiveKit still not available');
            }
        }, 100);
    };
    localScript.onerror = function() {
        console.error('Failed to load local LiveKit file');
    };
    document.head.appendChild(localScript);
};

document.head.appendChild(script);
