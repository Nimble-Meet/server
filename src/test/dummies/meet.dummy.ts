import { Meet } from '../../meet/entities/meet.entity';
import { User } from '../../user/entities/user.entity';

export const MEET_ID = 1;
export const MEET_NAME = 'test-meet';
export const MEET_DESCRIPTION = 'test-meet-description';

export const createMeet = ({
  id = MEET_ID,
  meetName = MEET_NAME,
  host,
  description = MEET_DESCRIPTION,
}: Partial<Meet> & { host: User }) =>
  Meet.create({
    id,
    meetName,
    host,
    description,
  });
