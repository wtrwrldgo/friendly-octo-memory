#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else
#import <React/RCTBridgeModule.h>
#endif
#import "YamapView.h"

@interface yamap : NSObject <RCTBridgeModule>

@property YamapView *map;

- (void)initWithKey:(NSString*)apiKey;

@end
