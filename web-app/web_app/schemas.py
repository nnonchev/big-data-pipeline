from typing import Optional
from pydantic import BaseModel


def as_form(cls: Type[BaseModel]):
    """
    This functions converts a json response to a web form.
    To use it, just add it as a class decorator to a pydantic class
    """
    params = []

    for field_name, model_field in cls.__fields__.items():
        model_field: ModelField  # type: ignore

        if not model_field.required:
            params.append(
                inspect.Parameter(
                    model_field.alias,
                    inspect.Parameter.POSITIONAL_ONLY,
                    default=Form(model_field.default),
                    annotation=model_field.outer_type_,
                )
            )
        else:
            params.append(
                inspect.Parameter(
                    model_field.alias,
                    inspect.Parameter.POSITIONAL_ONLY,
                    default=Form(...),
                    annotation=model_field.outer_type_,
                )
            )

    async def as_form_func(**data):
        return cls(**data)

    sig = inspect.signature(as_form_func)
    sig = sig.replace(parameters=params)
    as_form_func.__signature__ = sig  # type: ignore
    setattr(cls, "as_form", as_form_func)

    return cls


@as_form
class Row(BaseModel):
    country: str
    campus: str
    mobility: str
    contracts: int
    alternative_choice: str
    distance: float
    pro_contract: Optional[bool] = False
    consent: bool
