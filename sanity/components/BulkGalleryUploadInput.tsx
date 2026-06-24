import { UploadIcon } from '@sanity/icons';
import { Box, Button, Card, Flex, Stack, Text, useToast } from '@sanity/ui';
import { uuid } from '@sanity/uuid';
import { ChangeEvent, DragEvent, useCallback, useRef, useState } from 'react';
import { insert, PatchEvent, setIfMissing, useClient } from 'sanity';

type BulkGalleryUploadInputProps = {
  document?: {
    slug?: {
      current?: string;
    };
    title?: string;
  };
  onChange: (event: PatchEvent) => void;
  readOnly?: boolean;
  renderDefault: (props: BulkGalleryUploadInputProps) => React.ReactNode;
  value?: unknown[];
};

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const filenameExtension = (filename: string) => {
  const match = filename.match(/\.([a-z0-9]+)$/i);

  return match ? match[1].toLowerCase() : 'jpg';
};

const projectNameFromDocument = (document?: BulkGalleryUploadInputProps['document']) => {
  const source = document?.slug?.current || document?.title || 'project';

  return source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'project';
};

export function BulkGalleryUploadInput(props: BulkGalleryUploadInputProps) {
  const { document, onChange, readOnly, renderDefault, value } = props;
  const client = useClient({ apiVersion: '2025-01-01' });
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((file) => imageTypes.includes(file.type));

      if (files.length === 0) {
        toast.push({
          title: 'No supported images selected',
          status: 'warning',
        });
        return;
      }

      setIsUploading(true);

      try {
        const uploadedImages = [];
        const projectName = projectNameFromDocument(document);
        const startIndex = Array.isArray(value) ? value.length : 0;

        for (const [index, file] of files.entries()) {
          setUploadLabel(`Uploading ${index + 1} of ${files.length}`);
          const imageNumber = startIndex + index + 1;
          const cleanFilename = `${projectName}_${imageNumber}.${filenameExtension(file.name)}`;

          const asset = await client.assets.upload('image', file, {
            filename: cleanFilename,
          });

          uploadedImages.push({
            _key: uuid(),
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
            alt: `${document?.title || projectName} ${imageNumber}`,
          });
        }

        onChange(PatchEvent.from([setIfMissing([]), insert(uploadedImages, 'after', [-1])]));

        toast.push({
          title: `Uploaded ${uploadedImages.length} image${uploadedImages.length === 1 ? '' : 's'}`,
          status: 'success',
        });
      } catch (error) {
        toast.push({
          title: 'Bulk upload failed',
          description: error instanceof Error ? error.message : 'Please try again.',
          status: 'error',
        });
      } finally {
        setIsUploading(false);
        setUploadLabel('');
      }
    },
    [client, document, onChange, toast, value]
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.files) {
        uploadFiles(event.currentTarget.files);
      }

      event.currentTarget.value = '';
    },
    [uploadFiles]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!readOnly && event.dataTransfer.files) {
        uploadFiles(event.dataTransfer.files);
      }
    },
    [readOnly, uploadFiles]
  );

  return (
    <Stack space={4}>
      <Card
        border
        padding={4}
        radius={2}
        tone={readOnly ? 'transparent' : 'primary'}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <Flex align="center" gap={3} justify="space-between" wrap="wrap">
          <Box flex={1}>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Upload multiple gallery images
              </Text>
              <Text muted size={1}>
                Select or drag several JPG, PNG, WebP, or AVIF files. They will be added to the gallery below.
              </Text>
              {uploadLabel && (
                <Text muted size={1}>
                  {uploadLabel}
                </Text>
              )}
            </Stack>
          </Box>

          <Button
            disabled={readOnly || isUploading}
            icon={UploadIcon}
            mode="ghost"
            onClick={() => fileInputRef.current?.click()}
            text={isUploading ? 'Uploading...' : 'Choose images'}
            tone="primary"
          />
        </Flex>

        <input
          ref={fileInputRef}
          accept={imageTypes.join(',')}
          hidden
          multiple
          onChange={handleFileChange}
          type="file"
        />
      </Card>

      {renderDefault(props)}
    </Stack>
  );
}
