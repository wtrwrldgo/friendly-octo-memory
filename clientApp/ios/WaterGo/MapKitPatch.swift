import Foundation
import YandexMapsMobile

// Extension to ensure MapKit operations run on main thread
extension YMKMapView {
    @objc func safeSetCenter(_ center: YMKPoint, zoom: Float, azimuth: Float, tilt: Float, duration: Float) {
        if Thread.isMainThread {
            self.mapWindow.map.move(
                with: YMKCameraPosition(
                    target: center,
                    zoom: zoom,
                    azimuth: azimuth,
                    tilt: tilt
                ),
                animation: YMKAnimation(
                    type: YMKAnimationType.smooth,
                    duration: duration
                ),
                cameraCallback: nil
            )
        } else {
            DispatchQueue.main.async { [weak self] in
                self?.mapWindow.map.move(
                    with: YMKCameraPosition(
                        target: center,
                        zoom: zoom,
                        azimuth: azimuth,
                        tilt: tilt
                    ),
                    animation: YMKAnimation(
                        type: YMKAnimationType.smooth,
                        duration: duration
                    ),
                    cameraCallback: nil
                )
            }
        }
    }
}

// Ensure MapKit initialization happens on main thread
@objc public class MapKitInitializer: NSObject {
    @objc public static func initializeMapKit() {
        if Thread.isMainThread {
            YMKMapKit.setApiKey("34c20e7b-cade-43bd-a252-fea9b47389e6")
            YMKMapKit.setLocale("en_US")
            YMKMapKit.sharedInstance()
            NSLog("✅ [MapKitPatch] MapKit initialized on main thread")
        } else {
            DispatchQueue.main.sync {
                YMKMapKit.setApiKey("34c20e7b-cade-43bd-a252-fea9b47389e6")
                YMKMapKit.setLocale("en_US")
                YMKMapKit.sharedInstance()
                NSLog("✅ [MapKitPatch] MapKit initialized via main thread dispatch")
            }
        }
    }
}