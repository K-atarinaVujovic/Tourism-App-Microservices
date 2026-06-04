from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Role(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    TOURIST: _ClassVar[Role]
    AUTHOR: _ClassVar[Role]
TOURIST: Role
AUTHOR: Role

class GetProfileRequest(_message.Message):
    __slots__ = ("user_id",)
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    user_id: int
    def __init__(self, user_id: _Optional[int] = ...) -> None: ...

class ProfileResponse(_message.Message):
    __slots__ = ("id", "name", "lastname", "imageUrl", "biography", "quote", "user_id", "role")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    LASTNAME_FIELD_NUMBER: _ClassVar[int]
    IMAGEURL_FIELD_NUMBER: _ClassVar[int]
    BIOGRAPHY_FIELD_NUMBER: _ClassVar[int]
    QUOTE_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    ROLE_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    lastname: str
    imageUrl: str
    biography: str
    quote: str
    user_id: int
    role: Role
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., lastname: _Optional[str] = ..., imageUrl: _Optional[str] = ..., biography: _Optional[str] = ..., quote: _Optional[str] = ..., user_id: _Optional[int] = ..., role: _Optional[_Union[Role, str]] = ...) -> None: ...

class ProfileCreate(_message.Message):
    __slots__ = ("name", "lastname", "imageUrl", "biography", "quote", "user_id", "role")
    NAME_FIELD_NUMBER: _ClassVar[int]
    LASTNAME_FIELD_NUMBER: _ClassVar[int]
    IMAGEURL_FIELD_NUMBER: _ClassVar[int]
    BIOGRAPHY_FIELD_NUMBER: _ClassVar[int]
    QUOTE_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    ROLE_FIELD_NUMBER: _ClassVar[int]
    name: str
    lastname: str
    imageUrl: str
    biography: str
    quote: str
    user_id: int
    role: Role
    def __init__(self, name: _Optional[str] = ..., lastname: _Optional[str] = ..., imageUrl: _Optional[str] = ..., biography: _Optional[str] = ..., quote: _Optional[str] = ..., user_id: _Optional[int] = ..., role: _Optional[_Union[Role, str]] = ...) -> None: ...
