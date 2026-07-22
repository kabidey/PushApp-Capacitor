//
//  NotificationService.swift
//  NotificationService
//
//  Created by Pranjal on 21/04/25.
//

import UserNotifications

class NotificationService: UNNotificationServiceExtension {
    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        let bestAttemptContent = (request.content.mutableCopy() as! UNMutableNotificationContent)
        print("[PushApp Example] RECEIVED NotificationService extension userInfo=\(request.content.userInfo)")
        // Service extensions cannot call the main-app SDK; media attach only.

        if let mediaUrl = request.content.userInfo["media-url"] as? String,
           let url = URL(string: mediaUrl) {
            print("[PushApp Example] NotificationService attaching media-url=\(mediaUrl)")
            downloadAndAttachImage(url: url, content: bestAttemptContent, contentHandler: contentHandler)
        } else {
            print("[PushApp Example] NotificationService no media-url — pass-through")
            contentHandler(bestAttemptContent)
        }
    }
    
    private func downloadAndAttachImage(url: URL, content: UNMutableNotificationContent, contentHandler: @escaping (UNNotificationContent) -> Void) {
        let task = URLSession.shared.downloadTask(with: url) { (location, response, error) in
            if let error = error {
                print("Error downloading image: \(error)")
                contentHandler(content)
                return
            }
            
            guard let location = location else {
                contentHandler(content)
                return
            }
            
            let tmpDirectory = NSTemporaryDirectory()
            let tmpFile = "image_\(Date().timeIntervalSince1970).jpg"
            let tmpUrl = URL(fileURLWithPath: tmpDirectory).appendingPathComponent(tmpFile)
            
            do {
                try FileManager.default.moveItem(at: location, to: tmpUrl)
                
                if let attachment = try? UNNotificationAttachment(identifier: "image", url: tmpUrl, options: nil) {
                    content.attachments = [attachment]
                }
                
                contentHandler(content)
            } catch {
                print("Error moving downloaded file: \(error)")
                contentHandler(content)
            }
        }
        
        task.resume()
    }
    
    override func serviceExtensionTimeWillExpire() {
        // Handle timeout
    }
}
