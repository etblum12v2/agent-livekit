// LiveKit Wrapper to expose global LiveKit object
(function() {
    'use strict';
    
    console.log('Loading LiveKit wrapper...');
    
    // Load the LiveKit library
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/livekit-client@2.15.8/dist/livekit-client.umd.js';
    
    script.onload = function() {
        console.log('LiveKit script loaded');
        
        // Wait a bit for the library to initialize
        setTimeout(() => {
            // Check if LiveKit is available in various ways
            console.log('Checking for LiveKit object...');
            console.log('window.LiveKit:', typeof window.LiveKit);
            console.log('globalThis.LiveKit:', typeof globalThis.LiveKit);
            console.log('global.LiveKit:', typeof global.LiveKit);
            
            // Try to find the LiveKit object
            let LiveKitObj = null;
            
            // Check common global patterns
            if (typeof window.LiveKit !== 'undefined') {
                LiveKitObj = window.LiveKit;
                console.log('Found LiveKit on window');
            } else if (typeof globalThis.LiveKit !== 'undefined') {
                LiveKitObj = globalThis.LiveKit;
                console.log('Found LiveKit on globalThis');
            } else if (typeof LiveKit !== 'undefined') {
                LiveKitObj = LiveKit;
                console.log('Found LiveKit as global');
            } else {
                // Try to find it in the module exports
                console.log('Searching for LiveKit in loaded scripts...');
                
                // Check if it's available as a module
                try {
                    // Some UMD builds expose the library differently
                    const scripts = document.getElementsByTagName('script');
                    for (let i = 0; i < scripts.length; i++) {
                        if (scripts[i].src && scripts[i].src.includes('livekit-client')) {
                            console.log('Found LiveKit script tag:', scripts[i].src);
                        }
                    }
                } catch (e) {
                    console.log('Error searching for LiveKit:', e);
                }
                
                // Try to access it through common UMD patterns
                try {
                    if (typeof define === 'function' && define.amd) {
                        console.log('AMD environment detected');
                    }
                    if (typeof module !== 'undefined' && module.exports) {
                        console.log('CommonJS environment detected');
                        console.log('module.exports:', typeof module.exports);
                    }
                } catch (e) {
                    console.log('Error checking module patterns:', e);
                }
            }
            
            if (LiveKitObj) {
                console.log('LiveKit object found:', LiveKitObj);
                console.log('LiveKit.Room:', typeof LiveKitObj.Room);
                
                // Make sure it's globally accessible
                window.LiveKit = LiveKitObj;
                globalThis.LiveKit = LiveKitObj;
                
                // Dispatch custom event to notify that LiveKit is ready
                window.dispatchEvent(new CustomEvent('livekitReady', { 
                    detail: { LiveKit: LiveKitObj } 
                }));
                
                console.log('LiveKit is now globally available');
            } else {
                console.error('LiveKit object not found after loading');
                
                // Try fallback to local file
                console.log('Trying fallback to local LiveKit file...');
                const fallbackScript = document.createElement('script');
                fallbackScript.src = '/livekit-client.umd.js';
                fallbackScript.onload = function() {
                    console.log('Local LiveKit script loaded');
                    setTimeout(() => {
                        if (typeof window.LiveKit !== 'undefined') {
                            console.log('Local LiveKit found on window');
                            window.dispatchEvent(new CustomEvent('livekitReady', { 
                                detail: { LiveKit: window.LiveKit } 
                            }));
                        } else {
                            console.error('LiveKit still not available after fallback');
                        }
                    }, 100);
                };
                fallbackScript.onerror = function() {
                    console.error('Failed to load local LiveKit file');
                };
                document.head.appendChild(fallbackScript);
            }
        }, 100);
    };
    
    script.onerror = function() {
        console.error('Failed to load LiveKit from CDN');
        
        // Try local file immediately
        console.log('Trying local LiveKit file...');
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '/livekit-client.umd.js';
        fallbackScript.onload = function() {
            console.log('Local LiveKit script loaded');
            setTimeout(() => {
                if (typeof window.LiveKit !== 'undefined') {
                    console.log('Local LiveKit found on window');
                    window.dispatchEvent(new CustomEvent('livekitReady', { 
                        detail: { LiveKit: window.LiveKit } 
                    }));
                } else {
                    console.error('LiveKit still not available after local fallback');
                }
            }, 100);
        };
        fallbackScript.onerror = function() {
            console.error('Failed to load local LiveKit file');
        };
        document.head.appendChild(fallbackScript);
    };
    
    document.head.appendChild(script);
})();
