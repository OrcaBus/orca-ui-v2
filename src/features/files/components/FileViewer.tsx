import { ImageViewer, IFrameViewer, TextViewer, TableViewer, IgvViewer } from './viewers';
import config from '@/app/config';
import {
  IMAGE_FILETYPE_LIST,
  IFRAME_FILETYPE_LIST,
  PLAIN_FILETYPE_LIST,
  OTHER_FILETYPE_LIST,
  DELIMITER_SEPARATED_VALUE_FILETYPE_LIST,
  IGV_FILETYPE_LIST,
} from '@/utils/files';

type Props = { bucket: string; s3Key: string; s3ObjectId: string };

export const FileViewer = (props: Props) => {
  const { s3Key } = props;

  if (IMAGE_FILETYPE_LIST.find((f) => s3Key.endsWith(f))) {
    return <ImageViewer {...props} />;
  }

  if (IFRAME_FILETYPE_LIST.find((f) => s3Key.endsWith(f))) {
    return <IFrameViewer {...props} />;
  }

  if (
    PLAIN_FILETYPE_LIST.find((f) => s3Key.endsWith(f)) ||
    OTHER_FILETYPE_LIST.find((f) => s3Key.endsWith(f))
  ) {
    return <TextViewer {...props} />;
  }

  if (DELIMITER_SEPARATED_VALUE_FILETYPE_LIST.find((f) => s3Key.endsWith(f))) {
    return <TableViewer {...props} />;
  }

  if (IGV_FILETYPE_LIST.find((f) => s3Key.endsWith(f))) {
    const igvProps = {
      htsGetBaseUrl: config.apiEndpoint.htsget,
      ...props,
    };
    return <IgvViewer {...igvProps} />;
  }

  return <div>Unsupported Filetype</div>;
};
