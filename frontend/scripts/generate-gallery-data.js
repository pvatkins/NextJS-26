// frontend/scripts/generate-gallery-data.js

const fs = require('fs');
const path = require('path');
const ExifParser = require('exif-parser');

// --- Configuration ---
const GALLERY_ROOT_DIR = path.join(__dirname, '..', 'public', 'images', 'gallery');
const OUTPUT_FILE_PATH = path.join(__dirname, '..', 'src', 'data', 'galleryEvents.js');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

const slugify = (text) => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

/**
 * Calculates the date of the first day of ARRL Field Day for a given year.
 * ARRL Field Day is the fourth full weekend of June.
 * @param {number} year
 * @returns {string|null} Date in 'YYYY-MM-DD' format, or null if calculation fails.
 */
function getARRLFieldDayDate(year) {
    if (typeof year !== 'number' || year < 1900 || year > 2100) {
        console.error(`Invalid year provided for Field Day calculation: ${year}`);
        return null;
    }

    let firstJune = new Date(year, 5, 1);
    let dayOfWeek = firstJune.getDay();
    let firstSaturdayDate = firstJune.getDate() + (6 - dayOfWeek + 7) % 7;
    let date = new Date(year, 5, firstSaturdayDate);
    date.setDate(date.getDate() + (3 * 7));

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

async function generateGalleryData() {
    console.log(`Scanning directory: ${GALLERY_ROOT_DIR}`);

    const galleryEvents = [];

    try {
        const eventFolders = fs.readdirSync(GALLERY_ROOT_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        if (eventFolders.length === 0) {
            console.warn(`No event folders found in ${GALLERY_ROOT_DIR}.`);
        }

        for (const folderName of eventFolders) {
            const eventPath = path.join(GALLERY_ROOT_DIR, folderName);
            const photos = [];
            let eventDate = null;

            const imageFiles = fs.readdirSync(eventPath, { withFileTypes: true })
                .filter(dirent => dirent.isFile() && IMAGE_EXTENSIONS.includes(path.extname(dirent.name).toLowerCase()))
                .map(dirent => dirent.name);

            if (imageFiles.length === 0) {
                console.warn(`No supported image files found in folder: ${folderName}`);
                continue;
            }

            for (const filename of imageFiles) {
                const imageFilePath = path.join(eventPath, filename);
                let imageBuffer;

                try {
                    imageBuffer = fs.readFileSync(imageFilePath);
                    const parser = ExifParser.create(imageBuffer);
                    const exifData = parser.parse();

                    const width = exifData.imageSize ? exifData.imageSize.width : (exifData.tags ? exifData.tags.ImageWidth : 0);
                    const height = exifData.imageSize ? exifData.imageSize.height : (exifData.tags ? exifData.tags.ImageHeight : 0);

                    if (width === 0 || height === 0) {
                        console.warn(`Could not find dimensions in EXIF for ${imageFilePath}. Using 0x0.`);
                    }

                    let photoDate = null;
                    if (exifData.tags) {
                        if (exifData.tags.DateTimeOriginal) {
                            photoDate = new Date(exifData.tags.DateTimeOriginal * 1000);
                        } else if (exifData.tags.CreateDate) {
                            photoDate = new Date(exifData.tags.CreateDate * 1000);
                        } else if (exifData.tags.ModifyDate) {
                            photoDate = new Date(exifData.tags.ModifyDate * 1000);
                        }
                    }

                    if (photoDate) {
                        if (!eventDate || photoDate < eventDate) {
                            eventDate = photoDate;
                        }
                    } else {
                        console.warn(`No EXIF date found for photo: ${imageFilePath}`);
                    }

                    photos.push({
                        id: slugify(`${folderName}-${path.parse(filename).name}`),
                        filename: filename,
                        alt: `Photo from ${folderName.replace(/_/g, ' ')} - ${path.parse(filename).name.replace(/[-_]/g, ' ')}`,
                        width: width,
                        height: height,
                    });
                } catch (error) {
                    console.warn(`Error processing ${imageFilePath}: ${error.message}. Adding as placeholder.`);
                    photos.push({
                        id: slugify(`${folderName}-${path.parse(filename).name}`),
                        filename: filename,
                        alt: `Error loading photo from ${folderName.replace(/_/g, ' ')} - ${path.parse(filename).name.replace(/[-_]/g, ' ')}`,
                        width: 0,
                        height: 0,
                    });
                }
            }

            photos.sort((a, b) => a.filename.localeCompare(b.filename));

            let finalEventDateString = 'YYYY-MM-DD (Unknown)';

            if (eventDate) {
                finalEventDateString = eventDate.toISOString().split('T')[0];
            } else {
                const dateMatch = folderName.match(/^(\d{4}[-_]\d{2}[-_]\d{2})/);
                if (dateMatch) {
                    finalEventDateString = dateMatch[1].replace(/_/g, '-');
                    console.log(`Using date from folder name for ${folderName}: ${finalEventDateString}`);
                } else {
                    if (folderName.toLowerCase().includes('field-day')) {
                        const yearMatch = folderName.match(/(\d{4})/);
                        if (yearMatch) {
                            const year = parseInt(yearMatch[1], 10);
                            const calculatedFieldDayDate = getARRLFieldDayDate(year);
                            if (calculatedFieldDayDate) {
                                finalEventDateString = calculatedFieldDayDate;
                                console.log(`Inferred Field Day date for ${folderName}: ${finalEventDateString}`);
                            } else {
                                console.warn(`Could not calculate Field Day date for year ${year} in folder ${folderName}.`);
                            }
                        } else {
                            console.warn(`Could not extract year for Field Day calculation from folder name: ${folderName}`);
                        }
                    } else {
                        console.warn(`Could not determine date for folder ${folderName}. Date will be a placeholder.`);
                    }
                }
            }

            galleryEvents.push({
                id: slugify(folderName),
                name: folderName.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase()),
                date: finalEventDateString,
                folder: folderName,
                photos: photos,
            });
        }

        galleryEvents.sort((a, b) => {
            const dateA = a.date !== 'YYYY-MM-DD (Unknown)' ? a.date : '';
            const dateB = b.date !== 'YYYY-MM-DD (Unknown)' ? b.date : '';

            if (dateA && dateB) {
                return dateB.localeCompare(dateA);
            } else if (dateA) {
                return -1;
            } else if (dateB) {
                return 1;
            }
            return b.folder.localeCompare(a.folder);
        });

        const outputContent = `// This file is auto-generated by scripts/generate-gallery-data.js
// It contains metadata for your photo gallery.
// Dates and dimensions are inferred primarily from EXIF data (DateTimeOriginal, ImageWidth, ImageHeight).
// Fallback for date: 1) from folder name (e.g., YYYY-MM-DD_EventName),
// 2) for 'Field-Day' folders, calculated based on ARRL rules.
// IMPORTANT: You may need to manually refine 'name' and 'alt' texts for optimal display.

const galleryEvents = ${JSON.stringify(galleryEvents, null, 2)};

export default galleryEvents;
`;

        fs.writeFileSync(OUTPUT_FILE_PATH, outputContent, 'utf8');
        console.log(`Successfully generated gallery data to: ${OUTPUT_FILE_PATH}`);
        console.log(`Found ${galleryEvents.length} event folders.`);

    } catch (error) {
        console.error(`Fatal error generating gallery data: ${error.message}`);
    }
}

generateGalleryData();