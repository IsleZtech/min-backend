export class FindFriendsByPhoneDto {
  phoneNumbers: {
    country_code: string;
    number: string;
  }[];
}
