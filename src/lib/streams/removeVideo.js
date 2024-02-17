/**
 * Removes video tracks from the provided stream.
 *
 * @param {MediaStream} stream - The media stream from which to remove video tracks.
 */
export function removeVideo(stream) {
	if (stream) {
		stream.getVideoTracks().forEach(track => {
			stream.removeTrack(track)
		})
	}
}
