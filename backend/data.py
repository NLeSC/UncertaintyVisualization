from itertools import chain
import json

import pandas as pd


def split_on_column(df, col):
    """Split DataFrame df on the specified string-valued column.

    Returns a new DataFrame with one token per record.
    The new DataFrame's index points into df.
    """

    split = df[col].str.split()
    data = ((i, t) for i, part in enumerate(split) for t in part)
    index, terms = zip(*data)
    return pd.DataFrame.from_records({'term': terms},
                                     index=index)
